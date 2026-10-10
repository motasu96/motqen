-- Course-completion certificates ("شهادة إتمام دورة"), alongside the existing
-- memorization ('parts') and full-Quran ('khatm') kinds. The course is one of
-- the courses listed under a program on the site (e.g. the Tajweed program's
-- "أحكام التجويد العليا" or "تأهيل السند"), stored as its slug next to
-- program_slug.
--
-- Run this in the Supabase SQL Editor after 0001-0032, AFTER the website
-- code that issues these certificates is deployed (issuing one before this
-- migration is applied fails).

alter table public.certificates
  add column if not exists course_slug text;

alter table public.certificates drop constraint if exists certificates_scope_check;
alter table public.certificates
  add constraint certificates_scope_check check (scope in ('parts', 'khatm', 'course'));

-- Public verification (QR code) shows which course it was for.
grant select (course_slug) on public.certificates to anon;
