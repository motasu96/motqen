-- Adds per-student recitation range (من / إلى) and grade (التقدير) to
-- group_attendance, so a teacher logging a group circle session can record
-- what each attending student recited, not just whether they showed up —
-- mirroring how public.lessons records surah/ayah_range for 1:1 sessions,
-- plus a grade field like public.homework already has.
--
-- Run this in the Supabase SQL Editor after 0001-0023.

alter table public.group_attendance
  add column recitation_from text,
  add column recitation_to text,
  add column grade text;
