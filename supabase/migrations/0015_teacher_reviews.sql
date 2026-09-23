-- Real student reviews for teachers, shown on the "التقييمات" tab of a
-- teacher's profile. Replaces the old always-empty `teacher.reviews`
-- placeholder with a real, DB-backed list.
--
-- Run this in the Supabase SQL Editor after 0001-0014.
--
-- The reviewer's display name is stored on the row (not joined live from
-- `profiles`) because `profiles` RLS only lets a user read their own row
-- (plus admins, plus a teacher reading their own students) — a public
-- visitor or another student can't read an arbitrary reviewer's profile.

create table public.teacher_reviews (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, student_id)
);

alter table public.teacher_reviews enable row level security;

-- Reviews are public content on the teacher's profile page.
create policy "teacher_reviews: public read" on public.teacher_reviews
  for select using (true);

-- Only a student who has actually had a confirmed booking with the
-- teacher may leave (or later edit) a review for them.
create policy "teacher_reviews: students manage own" on public.teacher_reviews
  for all using (
    auth.uid() = student_id
    and exists (
      select 1 from public.bookings b
      where b.student_id = auth.uid() and b.teacher_id = teacher_reviews.teacher_id and b.status = 'confirmed'
    )
  ) with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.bookings b
      where b.student_id = auth.uid() and b.teacher_id = teacher_reviews.teacher_id and b.status = 'confirmed'
    )
  );

create policy "teacher_reviews: admins manage" on public.teacher_reviews
  for all using (public.is_admin()) with check (public.is_admin());
