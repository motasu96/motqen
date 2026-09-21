-- Real trial-session bookings: a student books a specific time slot with a
-- specific teacher (from their public profile page). Replaces the old
-- localStorage-only booking calendar.
--
-- Run this in the Supabase SQL Editor after 0001-0006.

create type booking_status as enum ('confirmed', 'cancelled');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  session_date date not null,
  session_time text not null,
  status booking_status not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- Prevents double-booking the same teacher's slot (race-safe at the DB level).
create unique index bookings_teacher_slot_unique
  on public.bookings (teacher_id, session_date, session_time)
  where status = 'confirmed';

alter table public.bookings enable row level security;

create policy "bookings: students manage own" on public.bookings
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

create policy "bookings: teachers read own" on public.bookings
  for select using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

create policy "bookings: admins manage" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());
