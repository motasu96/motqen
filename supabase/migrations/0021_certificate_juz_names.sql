alter table public.certificates
  add column juz_names text;

grant select (juz_names) on public.certificates to anon;
