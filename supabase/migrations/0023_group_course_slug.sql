-- Links a group circle to one specific course within its program (e.g. one
-- of the four Tajweed sub-courses), so a circle can represent a dedicated
-- teacher + room for that course rather than the program as a whole.
--
-- Run this in the Supabase SQL Editor after 0001-0022.

alter table public.group_sessions add column course_slug text;
