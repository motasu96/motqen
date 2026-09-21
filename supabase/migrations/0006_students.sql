-- Real student accounts: extends the auto-created profiles row with the
-- student-specific data collected during signup (gender/age, chosen
-- program, preferred schedule, and memorization plan settings).
--
-- Run this in the Supabase SQL Editor after 0001-0005.

create table public.students (
  id uuid primary key references public.profiles (id) on delete cascade,
  gender app_gender not null,
  age int,
  program_slug text,
  preferred_days text[] not null default '{}',
  preferred_time text,
  plan_duration_months int,
  already_memorized_juz int not null default 0,
  review_days_per_week int,
  plan_direction text,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;

create policy "students: read own row" on public.students
  for select using (auth.uid() = id);

create policy "students: update own row" on public.students
  for update using (auth.uid() = id);

create policy "students: admins read all" on public.students
  for select using (public.is_admin());

create policy "students: admins manage" on public.students
  for all using (public.is_admin()) with check (public.is_admin());
