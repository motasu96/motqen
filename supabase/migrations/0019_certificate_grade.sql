-- Adds المعدل (a numeric score) and التقدير (a fixed grade label) to
-- certificates, entered by the admin at issuance time alongside the
-- existing achievement text.
--
-- Run this in the Supabase SQL Editor after 0001-0018.

alter table public.certificates
  add column grade_percent numeric,
  add column grade_label text;
