-- Motqen initial schema: user profiles/roles, teacher applications, and
-- the live teachers table backing the public /teachers pages and the
-- admin teachers dashboard.
--
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

-- 1. Roles -------------------------------------------------------------

create type user_role as enum ('student', 'teacher', 'admin');
create type app_gender as enum ('male', 'female');
create type application_status as enum ('pending', 'approved', 'rejected');
create type teacher_status as enum ('active', 'suspended');

-- 2. profiles: one row per auth user, created automatically on signup ---

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'student',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper used by RLS policies below: is the current request from an admin?
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: read own row" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admins read all" on public.profiles
  for select using (public.is_admin());

create policy "profiles: update own row" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row when someone signs up. Role/full_name come from
-- the metadata passed to supabase.auth.signUp({ options: { data: { ... } } }).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. teacher_applications: public "join as teacher" submissions ---------

create table public.teacher_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  gender app_gender not null,
  specialties text[] not null default '{}',
  years_experience int,
  ijazah text,
  bio text not null,
  status application_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.teacher_applications enable row level security;

-- Anyone (including logged-out visitors) can submit an application.
create policy "teacher_applications: anyone can apply" on public.teacher_applications
  for insert with check (true);

create policy "teacher_applications: admins read all" on public.teacher_applications
  for select using (public.is_admin());

create policy "teacher_applications: admins update" on public.teacher_applications
  for update using (public.is_admin());

-- 4. teachers: the live, public-facing roster -----------------------------

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  application_id uuid references public.teacher_applications (id) on delete set null,
  slug text not null unique,
  name text not null,
  name_en text,
  title text,
  title_en text,
  bio text,
  bio_en text,
  avatar_url text,
  gender app_gender not null,
  specialties text[] not null default '{}',
  years_experience int not null default 0,
  students_count int not null default 0,
  completed_sessions int not null default 0,
  rating numeric(2,1) not null default 5.0,
  status teacher_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.teachers enable row level security;

-- Public site reads every active teacher; the admin panel (via is_admin())
-- can also see suspended ones.
create policy "teachers: public reads active" on public.teachers
  for select using (status = 'active' or public.is_admin());

create policy "teachers: admins manage" on public.teachers
  for all using (public.is_admin()) with check (public.is_admin());
