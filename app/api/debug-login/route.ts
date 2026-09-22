import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TEMPORARY diagnostic route — not linked from any UI. Forces a known
// password on the given account server-side (bypassing email/links/relay
// entirely) and immediately attempts a real sign-in with it, returning the
// full raw result. Used once to root-cause a login failure that survived
// every other check. Remove after use.
export async function POST(req: NextRequest) {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: { email?: unknown; password?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!email || !EMAIL_RE.test(email) || password.length < 6) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const admin = createAdminClient();

  let foundUser: { id: string; email: string | undefined; email_confirmed_at: string | null | undefined; created_at: string; banned_until?: string | null; last_sign_in_at?: string | null } | null = null;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ step: "listUsers", error: error.message }, { status: 502 });
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) {
      foundUser = {
        id: match.id,
        email: match.email,
        email_confirmed_at: match.email_confirmed_at,
        created_at: match.created_at,
        banned_until: (match as unknown as { banned_until?: string | null }).banned_until,
        last_sign_in_at: match.last_sign_in_at,
      };
      break;
    }
    if (data.users.length < 200) break;
  }

  if (!foundUser) {
    return NextResponse.json({ step: "listUsers", found: false, message: "No auth user with this email" }, { status: 200 });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", foundUser.id)
    .maybeSingle();

  const { error: updateError } = await admin.auth.admin.updateUserById(foundUser.id, { password });
  if (updateError) {
    return NextResponse.json({ step: "updateUserById", found: true, user: foundUser, profile, profileError: profileError?.message, error: updateError.message }, { status: 502 });
  }

  const anon = createAnonClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({ email, password });

  return NextResponse.json({
    step: "signInWithPassword",
    found: true,
    user: foundUser,
    profile,
    profileError: profileError?.message ?? null,
    passwordForceSet: true,
    signInSucceeded: Boolean(signInData.user),
    signInError: signInError ? { message: signInError.message, status: signInError.status, code: (signInError as unknown as { code?: string }).code } : null,
  });
}
