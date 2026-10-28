-- Lesson packages: private 1:1 lessons are paid, and a student books them
-- from the balance of a package the administration has activated for them
-- (after payment over WhatsApp today, PayPal later). Group circles stay free
-- and never touch packages.
--
--   * packages          — the catalogue (managed by admins, readable by all
--                         when active, so the public Prices page works).
--   * student_packages  — what each student has bought: lessons total/used,
--                         expiry, how and how much they paid.
--   * bookings          — three new columns record which package a booking was
--                         charged to (or that it was the free trial lesson).
--
-- The rules are enforced HERE, in the database, so no client (website, app,
-- or anyone calling the API directly) can book without a balance:
--
--   * Booking a private lesson uses, in this order: the student's free trial
--     lesson (once, if they have never booked before), then one lesson from
--     their active package that expires first. With neither, the insert fails
--     with the message NO_ACTIVE_PACKAGE.
--   * Cancelling a booking at least 24 hours before it starts gives the lesson
--     back (or the trial). Later cancellations do not.
--   * Students cannot edit a booking's student/teacher/slot/billing columns,
--     nor reopen a cancelled booking. Admins and the service role are exempt.
--   * Bookings that already exist when this runs are left exactly as they are.
--
-- Slot times are plain "HH:MM" text with no timezone, so the 24-hour rule
-- needs an assumed one: see public.booking_starts_at below (Asia/Riyadh).
--
-- Run this in the Supabase SQL Editor after 0001-0033.

-- 1. Catalogue --------------------------------------------------------------

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  description text,
  description_en text,
  lessons_count int not null check (lessons_count > 0),
  price_usd numeric(8, 2) not null check (price_usd >= 0),
  validity_days int not null default 30 check (validity_days > 0),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.packages enable row level security;

drop policy if exists "packages: anyone reads active" on public.packages;
create policy "packages: anyone reads active" on public.packages
  for select using (is_active);

drop policy if exists "packages: admins manage" on public.packages;
create policy "packages: admins manage" on public.packages
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.packages to anon;
grant select, insert, update, delete on public.packages to authenticated;

-- Example packages, switched OFF and priced 0 so nothing appears publicly
-- until you set real prices in the admin dashboard and activate them.
insert into public.packages (name, name_en, lessons_count, price_usd, validity_days, is_active, sort_order)
select v.name, v.name_en, v.lessons_count, 0, v.validity_days, false, v.sort_order
from (values
  ('الباقة الشهرية', 'Monthly package', 4, 30, 1),
  ('الباقة المكثفة', 'Intensive package', 8, 30, 2),
  ('الباقة الربع سنوية', 'Quarterly package', 24, 90, 3)
) as v(name, name_en, lessons_count, validity_days, sort_order)
where not exists (select 1 from public.packages);

-- 2. What each student has bought ----------------------------------------------

create table if not exists public.student_packages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  package_id uuid references public.packages (id) on delete set null,
  -- Snapshot of the package at activation: later edits to the catalogue
  -- (price, size, name) never change what a student already bought.
  package_name text not null,
  lessons_total int not null check (lessons_total > 0),
  lessons_used int not null default 0,
  price_paid numeric(8, 2) not null default 0 check (price_paid >= 0),
  payment_method text not null default 'whatsapp'
    check (payment_method in ('whatsapp', 'cash', 'paypal', 'gift', 'other')),
  status text not null default 'active' check (status in ('active', 'void')),
  activated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  activated_by uuid references public.profiles (id) on delete set null,
  note text,
  constraint student_packages_used_in_range check (lessons_used >= 0 and lessons_used <= lessons_total)
);

create index if not exists student_packages_student_idx
  on public.student_packages (student_id, status, expires_at);

alter table public.student_packages enable row level security;

drop policy if exists "student_packages: students read own" on public.student_packages;
create policy "student_packages: students read own" on public.student_packages
  for select using (auth.uid() = student_id);

drop policy if exists "student_packages: admins manage" on public.student_packages;
create policy "student_packages: admins manage" on public.student_packages
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.student_packages to authenticated;

-- 3. Billing columns on bookings -------------------------------------------------

alter table public.bookings
  add column if not exists student_package_id uuid references public.student_packages (id) on delete set null,
  add column if not exists is_trial boolean not null default false,
  add column if not exists credit_refunded boolean not null default false;

-- 4. Helpers --------------------------------------------------------------------

-- When does a booking start? Slots are wall-clock text with no timezone, so
-- this assumes one (used only for the 24-hour cancellation rule). Change
-- 'Asia/Riyadh' here if most of your students are elsewhere.
--
-- Bookings store whatever label the booking screen showed, which depends on
-- the language it was made in: "16:00", "4:00 م", "4:00 PM", "12:30 ص"... All
-- of those are understood here (م/PM = afternoon, ص/AM = morning). A value in
-- an unrecognised format counts as the start of that day.
create or replace function public.booking_starts_at(p_date date, p_time text)
returns timestamptz
language plpgsql
immutable
as $$
declare
  m text[] := regexp_match(btrim(coalesce(p_time, '')), '^([0-9]{1,2}):([0-9]{2})\s*(ص|م|am|pm)?$', 'i');
  h int;
  mi int;
  marker text;
begin
  if m is null then
    return p_date::timestamp at time zone 'Asia/Riyadh';
  end if;
  h := m[1]::int;
  mi := m[2]::int;
  marker := lower(coalesce(m[3], ''));
  if marker in ('م', 'pm') then
    if h < 12 then h := h + 12; end if;
  elsif marker in ('ص', 'am') then
    if h = 12 then h := 0; end if;
  end if;
  return (p_date + make_interval(hours => h, mins => mi))::timestamp at time zone 'Asia/Riyadh';
end;
$$;

-- Requests that skip the student rules: admins, and the service role / SQL
-- editor (no signed-in user).
create or replace function public.bookings_rules_bypassed()
returns boolean
language sql
stable
as $$
  select auth.uid() is null or public.is_admin();
$$;

-- 5. Charging a booking ---------------------------------------------------------

create or replace function public.bookings_charge_credit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sp public.student_packages%rowtype;
begin
  if new.status <> 'confirmed' then
    return new;
  end if;

  -- Admin / service-role bookings are created by hand and are not charged.
  if public.bookings_rules_bypassed() then
    return new;
  end if;

  -- A student books only for themselves. Row Level Security rejects anything
  -- else, but it runs after this trigger, so stop here and let it do so
  -- without touching (or revealing) anyone else's balance.
  if new.student_id is distinct from auth.uid() then
    return new;
  end if;

  -- The billing columns are the server's to set, never the client's.
  new.student_package_id := null;
  new.is_trial := false;
  new.credit_refunded := false;

  -- One booking at a time per student, so two quick requests cannot spend
  -- the same lesson (or both claim the trial).
  perform pg_advisory_xact_lock(hashtext('bookings_credit:' || new.student_id::text));

  -- 1) The free trial lesson: only a student who has never booked before
  --    (a trial that was cancelled in time and given back does not count).
  if not exists (
    select 1 from public.bookings b
    where b.student_id = new.student_id
      and not (b.is_trial and b.status = 'cancelled' and b.credit_refunded)
  ) then
    new.is_trial := true;
    return new;
  end if;

  -- 2) A lesson from the active package that expires first.
  select * into sp
  from public.student_packages p
  where p.student_id = new.student_id
    and p.status = 'active'
    and p.expires_at > now()
    and p.lessons_used < p.lessons_total
  order by p.expires_at asc, p.activated_at asc
  limit 1
  for update;

  if found then
    update public.student_packages set lessons_used = lessons_used + 1 where id = sp.id;
    new.student_package_id := sp.id;
    return new;
  end if;

  raise exception 'NO_ACTIVE_PACKAGE'
    using errcode = 'P0001',
          hint = 'Activate a lesson package to book private lessons.';
end;
$$;

drop trigger if exists bookings_charge_credit on public.bookings;
create trigger bookings_charge_credit
  before insert on public.bookings
  for each row execute function public.bookings_charge_credit();

-- 6. Editing and cancelling a booking -----------------------------------------------

create or replace function public.bookings_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bypass boolean := public.bookings_rules_bypassed();
  refundable boolean;
begin
  if not bypass then
    if (new.student_id, new.teacher_id, new.session_date, new.session_time,
        new.student_package_id, new.is_trial, new.credit_refunded)
       is distinct from
       (old.student_id, old.teacher_id, old.session_date, old.session_time,
        old.student_package_id, old.is_trial, old.credit_refunded)
       or (old.status = 'cancelled' and new.status = 'confirmed') then
      raise exception 'BOOKING_LOCKED'
        using errcode = 'P0001',
              hint = 'A booking can only be cancelled, not edited or reopened.';
    end if;
  end if;

  if old.status = 'confirmed' and new.status = 'cancelled' then
    refundable := bypass
      or public.booking_starts_at(old.session_date, old.session_time) - now() >= interval '24 hours';
    if refundable then
      new.credit_refunded := true;
      if old.student_package_id is not null then
        update public.student_packages
        set lessons_used = greatest(lessons_used - 1, 0)
        where id = old.student_package_id;
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_guard_update on public.bookings;
create trigger bookings_guard_update
  before update on public.bookings
  for each row execute function public.bookings_guard_update();

-- Deleting a confirmed booking behaves like cancelling it.
create or replace function public.bookings_refund_on_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'confirmed' and old.student_package_id is not null
     and (public.bookings_rules_bypassed()
          or public.booking_starts_at(old.session_date, old.session_time) - now() >= interval '24 hours') then
    update public.student_packages
    set lessons_used = greatest(lessons_used - 1, 0)
    where id = old.student_package_id;
  end if;
  return old;
end;
$$;

drop trigger if exists bookings_refund_on_delete on public.bookings;
create trigger bookings_refund_on_delete
  before delete on public.bookings
  for each row execute function public.bookings_refund_on_delete();

-- 7. Admin: activate a package for a student ---------------------------------------

-- Snapshots the package, works out the expiry, and records who did it. The
-- price defaults to the package's list price; pass 0 for a gift.
create or replace function public.activate_student_package(
  p_student_id uuid,
  p_package_id uuid,
  p_payment_method text default 'whatsapp',
  p_price numeric default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  pkg public.packages%rowtype;
  new_id uuid;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_ONLY' using errcode = '42501';
  end if;

  select * into pkg from public.packages where id = p_package_id;
  if not found then
    raise exception 'PACKAGE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.profiles where id = p_student_id and role = 'student') then
    raise exception 'STUDENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.student_packages (
    student_id, package_id, package_name, lessons_total, price_paid,
    payment_method, expires_at, activated_by, note
  ) values (
    p_student_id, pkg.id, pkg.name, pkg.lessons_count, coalesce(p_price, pkg.price_usd),
    p_payment_method, now() + make_interval(days => pkg.validity_days), auth.uid(), p_note
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.activate_student_package(uuid, uuid, text, numeric, text) from public, anon;
grant execute on function public.activate_student_package(uuid, uuid, text, numeric, text) to authenticated;

-- 8. A student's own balance, for the UI -------------------------------------------

create or replace function public.my_booking_credit()
returns table (lessons_left int, next_expiry timestamptz, trial_available boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(p.lessons_total - p.lessons_used), 0)::int,
    min(p.expires_at),
    not exists (
      select 1 from public.bookings b
      where b.student_id = auth.uid()
        and not (b.is_trial and b.status = 'cancelled' and b.credit_refunded)
    )
  from public.student_packages p
  where p.student_id = auth.uid()
    and p.status = 'active'
    and p.expires_at > now()
    and p.lessons_used < p.lessons_total;
$$;

revoke all on function public.my_booking_credit() from public, anon;
grant execute on function public.my_booking_credit() to authenticated;
