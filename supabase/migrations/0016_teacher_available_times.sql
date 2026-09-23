-- Each teacher now sets their own bookable times of day (instead of every
-- teacher sharing one hardcoded global list). Values are "HH:MM" (24h,
-- locale-independent); the app formats them for display per locale.
--
-- Run this in the Supabase SQL Editor after 0001-0015.

alter table public.teachers
  add column available_times text[] not null default array['16:00', '17:30', '19:00', '20:30'];

-- Column-level grant: a teacher may only ever write their own
-- available_times, never any other column on public.teachers (rating,
-- students_count, status, etc. stay admin-only).
revoke update on public.teachers from authenticated;
grant update (available_times) on public.teachers to authenticated;

create policy "teachers: teachers update own available_times" on public.teachers
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
