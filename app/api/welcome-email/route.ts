import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildWelcomeEmail } from "@/lib/emails/welcomeEmail";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// How long after account creation the welcome email may be requested (the
// signup flows call this within seconds of signUp).
const FRESH_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

// Sends the welcome email for a just-created account — and only that.
//
// The caller names an account (`userId`), never an address: the email goes to
// the address stored on that account, once, and only while the account is
// brand new. So this route cannot be used to mail arbitrary people or to
// repeat a message.
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service is not configured" }, { status: 501 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: { userId?: unknown; locale?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const locale: "ar" | "en" = payload.locale === "en" ? "en" : "ar";
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: "A valid userId is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error: lookupError } = await admin.auth.admin.getUserById(userId);
  const user = data?.user;
  const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (lookupError || !user?.email) return forbidden();
  if (Date.now() - new Date(user.created_at).getTime() > FRESH_ACCOUNT_WINDOW_MS) return forbidden();

  // Already sent for this account: nothing to do (and nothing to abuse).
  if (user.app_metadata?.welcome_email_sent) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Claim the send first so two quick calls cannot both go out. app_metadata
  // is server-only (users cannot edit it) and merges with the existing keys.
  const { error: claimError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { welcome_email_sent: true },
  });
  if (claimError) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  const rawName = user.user_metadata?.full_name;
  const name = typeof rawName === "string" ? rawName.trim().slice(0, 100) : "";
  const resend = new Resend(apiKey);
  const { subject, html } = buildWelcomeEmail(name || (locale === "en" ? "there" : "بك"), locale);

  let sendFailed = false;
  try {
    const { error } = await resend.emails.send({
      from: "متقن | Motqen <info@motqen.site>",
      to: user.email,
      subject,
      html,
    });
    sendFailed = Boolean(error);
  } catch {
    sendFailed = true;
  }

  if (sendFailed) {
    // Let a later call try again.
    await admin.auth.admin.updateUserById(userId, { app_metadata: { welcome_email_sent: false } });
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
