import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Applies a password directly to the account tied to a one-time setup
// token, bypassing Supabase's client-side magic-link/recovery-session flow
// entirely (see migration 0011 for why). The token is single-use and
// time-limited.
export async function POST(req: NextRequest) {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: { token?: unknown; password?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const token = typeof payload.token === "string" ? payload.token.trim() : "";
  const password = typeof payload.password === "string" ? payload.password.trim() : "";
  if (!token || !TOKEN_RE.test(token) || password.length < 6) {
    return NextResponse.json({ error: "Required fields are missing", reason: "invalid_input" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: setupToken, error: tokenError } = await admin
    .from("account_setup_tokens")
    .select("token, user_id, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (tokenError || !setupToken) {
    return NextResponse.json({ error: "Invalid or expired link", reason: "not_found" }, { status: 404 });
  }
  if (setupToken.used_at) {
    return NextResponse.json({ error: "This link has already been used", reason: "already_used" }, { status: 410 });
  }
  if (new Date(setupToken.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This link has expired", reason: "expired" }, { status: 410 });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(setupToken.user_id, { password });
  if (updateError) {
    return NextResponse.json({ error: updateError.message, reason: "update_failed" }, { status: 502 });
  }

  await admin.from("account_setup_tokens").update({ used_at: new Date().toISOString() }).eq("token", token);

  return NextResponse.json({ ok: true });
}
