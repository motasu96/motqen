-- Real exams (teacher-created, per student), memorization-completion
-- records (the "archive"), and attendance tracking (added to lessons),
-- replacing the remaining mock data on the reports/exams/archive pages.
--
-- Run this in the Supabase SQL Editor after 0001-0009.

-- 1. Attendance: a lesson row now represents "this session happened",
--    whether or not the student actually attended. Surah/ayah range are
--    only meaningful when they did.
alter table public.lessons alter column surah drop not null;
alter table public.lessons alter column ayah_range drop not null;
alter table public.lessons add column attended boolean not null default true;

-- 2. Exams: created by a teacher for one of their own students.
create type exam_status as enum ('upcoming', 'completed');

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  title text not null,
  exam_date date not null,
  status exam_status not null default 'upcoming',
  score numeric,
  max_score numeric,
  created_at timestamptz not null default now()
);

alter table public.exams enable row level security;

create policy "exams: students read own" on public.exams
  for select using (auth.uid() = student_id);

create policy "exams: teachers manage own" on public.exams
  for all using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

create policy "exams: admins manage" on public.exams
  for all using (public.is_admin()) with check (public.is_admin());

-- 3. Memorization records: the teacher manually confirms a portion is
--    memorized. This backs the student's "Archive" page.
create table public.memorization_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  title text not null,
  pages int not null default 0,
  completed_date date not null,
  created_at timestamptz not null default now()
);

alter table public.memorization_records enable row level security;

create policy "memorization_records: students read own" on public.memorization_records
  for select using (auth.uid() = student_id);

create policy "memorization_records: teachers manage own" on public.memorization_records
  for all using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

create policy "memorization_records: admins manage" on public.memorization_records
  for all using (public.is_admin()) with check (public.is_admin());
