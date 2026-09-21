-- Real lesson history (what was covered in a completed session) and
-- homework assignments, replacing the mock data on both dashboards.
--
-- Run this in the Supabase SQL Editor after 0001-0007.

-- Lets a teacher read the profile (name) of a student who has booked a
-- session with them — needed to show real student names when assigning
-- homework or logging a lesson. Without this, RLS on profiles would hide
-- the student's full_name from the teacher.
create policy "profiles: teachers read their students" on public.profiles
  for select using (
    exists (
      select 1 from public.bookings b
      join public.teachers t on t.id = b.teacher_id
      where b.student_id = profiles.id and t.profile_id = auth.uid()
    )
  );

create type homework_type as enum ('recitation', 'review', 'tajweed');
create type homework_status as enum ('pending', 'submitted', 'graded');

create table public.homework (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  title text not null,
  type homework_type not null default 'recitation',
  due_date date not null,
  status homework_status not null default 'pending',
  grade text,
  submitted_at timestamptz,
  graded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.homework enable row level security;

create policy "homework: students read own" on public.homework
  for select using (auth.uid() = student_id);

-- Students may only flip pending -> submitted; enforced in the app layer
-- (RLS here just scopes rows to the student's own).
create policy "homework: students update own" on public.homework
  for update using (auth.uid() = student_id);

create policy "homework: teachers manage own" on public.homework
  for all using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

create policy "homework: admins manage" on public.homework
  for all using (public.is_admin()) with check (public.is_admin());

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  session_date date not null,
  surah text not null,
  ayah_range text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "lessons: students read own" on public.lessons
  for select using (auth.uid() = student_id);

create policy "lessons: teachers manage own" on public.lessons
  for all using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

create policy "lessons: admins manage" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());
