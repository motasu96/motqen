import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildWelcomeEmail } from "@/lib/emails/welcomeEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service is not configured" }, { status: 501 });
  }

  let payload: { name?: unknown; email?: unknown; locale?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const locale: "ar" | "en" = payload.locale === "en" ? "en" : "ar";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildWelcomeEmail(name || (locale === "en" ? "there" : "بك"), locale);

  try {
    // Sender uses Resend's shared test domain until motqen.site is verified
    // in the Resend dashboard (Domains tab) with its own "from" address.
    const { error } = await resend.emails.send({
      from: "Motqen <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });
    if (error) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
