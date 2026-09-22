import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One-time, self-disabling admin bootstrap: only works while no admin
// profile exists yet. Once the first admin account is created this route
// permanently refuses (409), so it's safe to leave deployed.
export async function POST(req: NextRequest) {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: { email?: unknown; password?: unknown; fullName?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const fullName = typeof payload.fullName === "string" ? payload.fullName.trim().slice(0, 100) : "";

  if (!email || !EMAIL_RE.test(email) || password.length < 6 || !fullName) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 502 });
  }
  if (count && count > 0) {
    return NextResponse.json({ error: "An admin account already exists", reason: "already_bootstrapped" }, { status: 409 });
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin", full_name: fullName },
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "Failed to create account" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
