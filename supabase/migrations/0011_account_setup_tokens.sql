-- Custom one-time tokens for the "set your password" step of the teacher
-- welcome email. Supabase's own magic-link recovery flow (admin.generateLink
-- + client-side hash/session parsing) proved unreliable for this exact path
-- in production, even though the same account and password worked instantly
-- when set directly via the service-role admin API. This table lets our own
-- server-side /api/account-setup route apply the password directly instead
-- of depending on the browser to establish a Supabase recovery session.
create table public.account_setup_tokens (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.account_setup_tokens enable row level security;
-- No policies: only the service-role key (which bypasses RLS) ever reads or
-- writes this table, from server-only API routes.
