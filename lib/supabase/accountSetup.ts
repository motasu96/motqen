import { SupabaseClient } from "@supabase/supabase-js";

const TOKEN_TTL_HOURS = 72;

// Creates a one-time account-setup token for a freshly created (or
// re-linked) user and returns the link to email them. Verified and consumed
// server-side by /api/account-setup, which sets the password directly via
// the admin API — see migration 0011 for why this bypasses Supabase's own
// magic-link recovery flow.
export async function createAccountSetupLink(
  admin: SupabaseClient,
  userId: string,
  siteUrl: string
): Promise<{ token: string; link: string } | { error: string }> {
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from("account_setup_tokens")
    .insert({ user_id: userId, expires_at: expiresAt })
    .select("token")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create setup token" };
  }

  return { token: data.token, link: `${siteUrl}/account-setup?token=${data.token}` };
}
