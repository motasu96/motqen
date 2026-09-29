-- Lets the signup flow match a student's chosen days + program against
-- real teachers/group circles, so the student can pick who to join with
-- instead of just recording a soft preference nobody acts on.
--
-- Run this in the Supabase SQL Editor after 0001-0025.

-- Days of the week (smallint 0-6, same 0=Saturday..6=Friday convention as
-- group_sessions.day_of_week) a teacher generally offers private 1:1
-- lessons on. available_times (time-of-day) already exists and is
-- unaffected; this only adds which days those times apply to.
alter table public.teachers
  add column if not exists available_days smallint[] not null default '{}';

-- The private teacher a student chose to be matched with during signup,
-- when they picked an individual teacher instead of joining a group
-- circle. Purely informational — no booking is created automatically.
alter table public.students
  add column if not exists preferred_teacher_id uuid references public.teachers (id) on delete set null;

-- Group circles need to be browsable during signup, before the student's
-- account exists yet, so matching them by day/program can't require
-- authentication anymore. Mirrors how public.teachers is already public.
drop policy if exists "group_sessions: authenticated read" on public.group_sessions;
drop policy if exists "group_sessions: public read" on public.group_sessions;
create policy "group_sessions: public read" on public.group_sessions
  for select using (true);
