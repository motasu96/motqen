-- Private 1:1 lessons are now paid, but nothing is charged on the site: a
-- student gets the price and payment methods over WhatsApp, either from
-- the administration or from the teacher. This lets a teacher opt in to
-- sharing a WhatsApp number for that.
--
-- It lives in its own table rather than as a column on public.teachers,
-- because public.teachers is readable by everyone (including logged-out
-- visitors) — a teacher's personal number must only be visible to
-- students actually connected to them: anyone with a confirmed booking
-- with them, or who chose them as their private teacher at signup.
--
-- Run this in the Supabase SQL Editor after 0001-0029.

create table if not exists public.teacher_contacts (
  teacher_id uuid primary key references public.teachers (id) on delete cascade,
  -- International format, digits only (what wa.me expects), e.g. 970599123456.
  whatsapp text not null check (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);

alter table public.teacher_contacts enable row level security;

drop policy if exists "teacher_contacts: teachers manage own" on public.teacher_contacts;
create policy "teacher_contacts: teachers manage own" on public.teacher_contacts
  for all using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  ) with check (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

drop policy if exists "teacher_contacts: connected students read" on public.teacher_contacts;
create policy "teacher_contacts: connected students read" on public.teacher_contacts
  for select using (
    exists (
      select 1 from public.bookings b
      where b.teacher_id = teacher_contacts.teacher_id
        and b.student_id = auth.uid()
        and b.status = 'confirmed'
    )
    or exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.preferred_teacher_id = teacher_contacts.teacher_id
    )
  );

drop policy if exists "teacher_contacts: admins manage" on public.teacher_contacts;
create policy "teacher_contacts: admins manage" on public.teacher_contacts
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.teacher_contacts to authenticated;
