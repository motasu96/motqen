-- Captures the rest of what a student enters during signup (country,
-- city, email) alongside the fields students already had, so the
-- teacher/admin "student file" view can show everything the student
-- submitted at registration. Existing RLS on public.students (teachers
-- read their own students, admins read all) already covers these new
-- columns since RLS applies per-row, not per-column.
--
-- Run this in the Supabase SQL Editor after 0001-0024.

alter table public.students
  add column country text,
  add column city text,
  add column email text;
