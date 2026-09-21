-- Real admin-authored announcements, replacing the mock notices shown on
-- the admin/student/teacher dashboards.
--
-- Run this in the Supabase SQL Editor after 0001-0008.

create type notice_audience as enum ('all', 'students', 'teachers');

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience notice_audience not null default 'all',
  created_at timestamptz not null default now()
);

alter table public.notices enable row level security;

create policy "notices: authenticated users read" on public.notices
  for select using (auth.role() = 'authenticated');

create policy "notices: admins manage" on public.notices
  for all using (public.is_admin()) with check (public.is_admin());
