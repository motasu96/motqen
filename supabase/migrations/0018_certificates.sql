-- Electronic memorization certificates, issued by an admin for a student
-- who completed a given portion. The certificate's design is a fixed
-- template (rendered client-side); only student name, teacher name,
-- issuing admin's name, achievement text and date vary per certificate.
--
-- Names are denormalized onto the row at issuance time (not joined live
-- from profiles/teachers) for two reasons: (1) a student's own RLS on
-- `profiles` only lets them read their own row, so they could never
-- resolve the issuing admin's name via a live join; (2) a certificate is
-- a point-in-time record — it should keep showing the name as it was
-- when issued even if the person's display name changes later.
--
-- Run this in the Supabase SQL Editor after 0001-0017.

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_name text not null,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  teacher_name text not null,
  issued_by uuid references public.profiles (id) on delete set null,
  issued_by_name text not null,
  achievement text not null,
  issued_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

create policy "certificates: students read own" on public.certificates
  for select using (auth.uid() = student_id);

create policy "certificates: teachers read their students'" on public.certificates
  for select using (
    exists (select 1 from public.teachers t where t.id = teacher_id and t.profile_id = auth.uid())
  );

create policy "certificates: admins manage" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());
