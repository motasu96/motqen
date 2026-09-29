-- 0016 locked public.teachers updates down to a column-level grant
-- (available_times only), so when 0026 later added available_days,
-- teachers had no privilege to write it and saving the schedule's day
-- picker silently failed with a Postgres permission error.
--
-- Run this in the Supabase SQL Editor after 0001-0027.

grant update (available_days) on public.teachers to authenticated;
