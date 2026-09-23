-- Per-student attendance for group circles (حلقات جماعية). A group_session
-- row is a recurring weekly template (day_of_week + time), not a specific
-- dated occurrence, so attendance is recorded per (group, student, date) —
-- one row per enrolled student per day the circle actually met, mirroring
-- how public.lessons records a 1:1 session.
--
-- Run this in the Supabase SQL Editor after 0001-0016.

create table public.group_attendance (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_sessions (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null,
  attended boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (group_id, student_id, session_date)
);

alter table public.group_attendance enable row level security;

create policy "group_attendance: students read own" on public.group_attendance
  for select using (auth.uid() = student_id);

create policy "group_attendance: teachers manage own" on public.group_attendance
  for all using (
    exists (
      select 1 from public.group_sessions g
      join public.teachers t on t.id = g.teacher_id
      where g.id = group_attendance.group_id and t.profile_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.group_sessions g
      join public.teachers t on t.id = g.teacher_id
      where g.id = group_attendance.group_id and t.profile_id = auth.uid()
    )
  );

create policy "group_attendance: admins manage" on public.group_attendance
  for all using (public.is_admin()) with check (public.is_admin());
