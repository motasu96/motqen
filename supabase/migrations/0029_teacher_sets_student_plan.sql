-- The memorization-plan fields (duration, already-memorized juz', review
-- days, direction) used to be set by the student during signup. That step
-- was removed from signup — a teacher now assesses the student's real
-- level and sets/updates the plan from the teacher's Students page
-- instead. This lets a teacher write those specific columns for a student
-- connected to them (via a booking or as their chosen preferred teacher),
-- and adds plan_started_at so the weekly-progress calculation is based on
-- when the plan was actually set rather than the student's signup date.
--
-- Run this in the Supabase SQL Editor after 0001-0028.

alter table public.students
  add column if not exists plan_started_at timestamptz;

-- Column-level grant: any authenticated user (student or teacher) may only
-- ever write these specific plan columns on public.students, never any
-- other column (gender, country, preferred_teacher_id, etc. stay
-- admin/service-role-only). Mirrors the pattern used for
-- public.teachers.available_times in migration 0016.
revoke update on public.students from authenticated;
grant update (plan_duration_months, already_memorized_juz, review_days_per_week, plan_direction, plan_started_at)
  on public.students to authenticated;

drop policy if exists "students: teachers update plan for their students" on public.students;
create policy "students: teachers update plan for their students" on public.students
  for update using (
    exists (
      select 1 from public.bookings b
      join public.teachers t on t.id = b.teacher_id
      where b.student_id = students.id and t.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.teachers t
      where t.id = students.preferred_teacher_id and t.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bookings b
      join public.teachers t on t.id = b.teacher_id
      where b.student_id = students.id and t.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.teachers t
      where t.id = students.preferred_teacher_id and t.profile_id = auth.uid()
    )
  );
