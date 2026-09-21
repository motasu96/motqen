-- Lets teacher-application submitters attach a personal photo and a
-- certificate/ijazah document. Photos are public (they become the
-- teacher's avatar once approved); certificates are private and only
-- readable by admins via a signed URL.
--
-- Run this in the Supabase SQL Editor after 0001 and 0002.

alter table public.teacher_applications add column photo_url text;
alter table public.teacher_applications add column certificate_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('teacher-photos', 'teacher-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('teacher-certificates', 'teacher-certificates', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']);

create policy "teacher-photos: anyone can upload" on storage.objects
  for insert with check (bucket_id = 'teacher-photos');

create policy "teacher-photos: public read" on storage.objects
  for select using (bucket_id = 'teacher-photos');

create policy "teacher-certificates: anyone can upload" on storage.objects
  for insert with check (bucket_id = 'teacher-certificates');

create policy "teacher-certificates: admins read" on storage.objects
  for select using (bucket_id = 'teacher-certificates' and public.is_admin());
