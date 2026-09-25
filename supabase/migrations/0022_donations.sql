-- Donations paid through NOWPayments (crypto). Rows are written only by the
-- server (service role) from /api/donate/crypto and the IPN webhook; admins
-- can read them from the dashboard.
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  method text not null default 'crypto' check (method in ('crypto')),
  name text not null,
  email text not null,
  amount_usd numeric(10, 2) not null check (amount_usd > 0),
  frequency text not null check (frequency in ('once', 'monthly')),
  status text not null default 'created',
  invoice_id text,
  payment_id text,
  pay_currency text,
  actually_paid numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donations enable row level security;

create policy "donations: admins read" on public.donations
  for select using (public.is_admin());
