-- Real group circles (حلقات جماعية), replacing the mock data that used to
-- back both the teacher and student "groups" dashboard pages.
--
-- Run this in the Supabase SQL Editor after 0001-0013.

create table public.group_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  title text not null,
  title_en text,
  program_slug text,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  session_time text not null,
  capacity int not null default 6 check (capacity > 0),
  created_at timestamptz not null default now()
);

alter table public.group_sessions enable row level security;

-- Every signed-in user (student or teacher) needs to browse all groups to
-- decide which one to join, so read access is broad; writes stay scoped.
create policy "group_sessions: authenticated read" on public.group_sessions
  for select using (auth.uid() is not null);

create policy "group_sessions: teachers manage own" on public.group_sessions
  for all using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

create policy "group_sessions: admins manage" on public.group_sessions
  for all using (public.is_admin()) with check (public.is_admin());

create table public.group_enrollments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, student_id)
);

alter table public.group_enrollments enable row level security;

create policy "group_enrollments: students manage own" on public.group_enrollments
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "group_enrollments: teachers read own group" on public.group_enrollments
  for select using (
    exists (
      select 1 from public.group_sessions g
      join public.teachers t on t.id = g.teacher_id
      where g.id = group_enrollments.group_id and t.profile_id = auth.uid()
    )
  );

create policy "group_enrollments: admins manage" on public.group_enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- A student who joins a group circle without ever booking a 1:1 session
-- isn't covered by the existing "teachers read their students" policy, so
-- the teacher can't see their name. This covers group members specifically.
create policy "profiles: teachers read their group members" on public.profiles
  for select using (
    exists (
      select 1 from public.group_enrollments ge
      join public.group_sessions g on g.id = ge.group_id
      join public.teachers t on t.id = g.teacher_id
      where ge.student_id = profiles.id and t.profile_id = auth.uid()
    )
  );
