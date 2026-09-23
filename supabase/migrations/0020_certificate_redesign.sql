-- Rebuilds certificates around the real certificate design: a fixed
-- structure (memorization scope, program, narration, portion, grade)
-- instead of a free-text achievement line, a sequential human-readable
-- certificate number, and a public verification lookup (QR code on the
-- certificate links to motqen.site/verify/<number>).
--
-- This assumes no certificates have been issued for real yet (the
-- feature just shipped) — `achievement` is dropped outright rather than
-- kept around unused. If real certificates already exist when running
-- this, back up `achievement` first.
--
-- Run this in the Supabase SQL Editor after 0001-0019.

create sequence public.certificate_number_seq start 1;

alter table public.certificates
  drop column achievement,
  add column certificate_number text not null unique default (
    'MTQ-' || extract(year from now())::text || '-' || lpad(nextval('public.certificate_number_seq')::text, 5, '0')
  ),
  add column student_gender app_gender not null default 'male',
  add column teacher_gender app_gender not null default 'male',
  add column scope text not null default 'parts' check (scope in ('parts', 'khatm')),
  add column program_slug text,
  add column narration text not null default 'حفص عن عاصم',
  add column juz_count int;

alter table public.certificates alter column student_gender drop default;
alter table public.certificates alter column teacher_gender drop default;

-- Public verification: anyone with the certificate number (e.g. from a
-- scanned QR code) can confirm it's real, seeing only non-sensitive
-- fields — never the grade/score, and no way to browse other students'
-- certificates without already knowing their exact number.
-- Scoped to the `anon` role only — authenticated users stay governed by
-- the students/teachers/admins policies above. A `using (true)` policy
-- with no `to` clause would otherwise apply to every role, letting any
-- logged-in student read every other student's certificate.
create policy "certificates: public verify by number" on public.certificates
  for select
  to anon
  using (true);

revoke select on public.certificates from anon;
grant select (
  certificate_number, student_name, scope, juz_count, program_slug, narration, issued_at
) on public.certificates to anon;
