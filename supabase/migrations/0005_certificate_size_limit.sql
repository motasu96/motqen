-- Raises the teacher-certificates bucket size limit from 15MB to 50MB
-- so applicants can attach larger scanned/photographed certificate
-- files without hitting "exceeded the maximum allowed size".
--
-- Run this in the Supabase SQL Editor after 0001-0004.
--
-- Note: Supabase also enforces a project-wide upload size cap in
-- Dashboard -> Storage -> Settings ("Global file size limit"). If it is
-- set below 50MB, raise it there too or this bucket limit alone won't
-- be enough.

update storage.buckets
set file_size_limit = 52428800
where id = 'teacher-certificates';
