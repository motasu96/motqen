-- Widens the teacher-certificates bucket to accept Word documents
-- alongside PDF/images, and raises the size limit slightly for
-- multi-page scanned certificates.
--
-- Run this in the Supabase SQL Editor after 0001-0003.

update storage.buckets
set
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  file_size_limit = 15728640
where id = 'teacher-certificates';
