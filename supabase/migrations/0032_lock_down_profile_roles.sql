-- SECURITY: stop users from granting themselves the teacher/admin role.
--
-- Two holes let any registered (or registering) user become an admin:
--
-- 1. 0001 created the policy "profiles: update own row" with no column
--    limit, and nothing ever revoked the table-wide UPDATE grant, so a
--    signed-in user could run
--        update profiles set role = 'admin' where id = auth.uid()
--    straight from the browser with the public anon key.
--
-- 2. handle_new_user() took the new profile's role from
--    raw_user_meta_data — the field supabase.auth.signUp({ options:
--    { data: {...} } }) lets the caller fill in freely — so anyone could
--    sign up with data: { role: 'admin' }.
--
-- Fixes:
--  - A user may only update their own full_name and phone on profiles.
--    (role stays writable only by the service role / SQL editor.)
--  - The signup trigger reads the role from raw_app_meta_data, which can
--    only be set server-side (auth.admin.createUser({ app_metadata })),
--    and anything unrecognised becomes 'student'. The server routes that
--    create teacher/admin accounts (teacher-account, teacher-resend-setup,
--    bootstrap-admin) now set app_metadata.role.
--
-- DEPLOY ORDER: deploy the website code first, THEN run this. Between the
-- two, a teacher approved on the old code would be created as a student.
--
-- Run this in the Supabase SQL Editor after 0001-0031.
--
-- AFTERWARDS, audit existing accounts for anyone who used these holes
-- (also check Authentication > Users in the Supabase dashboard):
--    select p.id, p.role, p.full_name, p.created_at, u.email
--    from public.profiles p join auth.users u on u.id = p.id
--    where p.role <> 'student' order by p.created_at;
-- Every row should be a person you know. Fix a wrong one with:
--    update public.profiles set role = 'student' where id = '<uuid>';

-- 1. profiles: users can change their name and phone, nothing else ---------

revoke update on public.profiles from authenticated;
revoke update on public.profiles from anon;
grant update (full_name, phone) on public.profiles to authenticated;

drop policy if exists "profiles: update own row" on public.profiles;
create policy "profiles: update own row" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 2. signup trigger: the role comes from app_metadata, never user_metadata --

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    case
      when new.raw_app_meta_data->>'role' in ('student', 'teacher', 'admin')
        then (new.raw_app_meta_data->>'role')::user_role
      else 'student'::user_role
    end,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;
