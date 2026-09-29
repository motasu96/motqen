-- A student who picked a private teacher during signup (instead of
-- joining a group circle) is recorded via students.preferred_teacher_id
-- (see 0026), but that teacher has no way to see them yet — the existing
-- "teachers read their students" policies (0008, 0013) only cover
-- students who already booked a session or joined a group. This lets a
-- teacher read the profile/student row of anyone who chose them, so they
-- can reach out and offer a first session.
--
-- Run this in the Supabase SQL Editor after 0001-0026.

drop policy if exists "profiles: teachers read students who chose them" on public.profiles;
create policy "profiles: teachers read students who chose them" on public.profiles
  for select using (
    exists (
      select 1 from public.students s
      join public.teachers t on t.id = s.preferred_teacher_id
      where s.id = profiles.id and t.profile_id = auth.uid()
    )
  );

drop policy if exists "students: teachers read students who chose them" on public.students;
create policy "students: teachers read students who chose them" on public.students
  for select using (
    exists (
      select 1 from public.teachers t
      where t.id = students.preferred_teacher_id and t.profile_id = auth.uid()
    )
  );
