-- Lets a teacher read the full student record (program, memorization plan
-- settings) for any student who has booked a session with them. Needed for
-- real per-teacher stats (average student progress) and the teacher's
-- schedule page, both of which currently only have access to bookings and
-- profiles.
--
-- Run this in the Supabase SQL Editor after 0001-0012.

create policy "students: teachers read their students" on public.students
  for select using (
    exists (
      select 1 from public.bookings b
      join public.teachers t on t.id = b.teacher_id
      where b.student_id = students.id and t.profile_id = auth.uid()
    )
  );
