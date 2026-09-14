import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildEmail(name: string, locale: string) {
  const isArabic = locale !== "en";
  const subject = isArabic ? "مرحبًا بك في متقن" : "Welcome to Motqen";
  const greeting = isArabic ? `مرحبًا ${name}،` : `Hi ${name},`;
  const body = isArabic
    ? "تم تأكيد تسجيلك بنجاح في مقرأة متقن. نتمنى لك رحلة موفقة في تعلم القرآن الكريم."
    : "Your registration with Motqen Quran Academy has been confirmed. We wish you a rewarding journey in learning the Holy Quran.";
  const dir = isArabic ? "rtl" : "ltr";

  const html = `<div dir="${dir}" style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#2E2418">
    <h2 style="color:#A97F32">${subject}</h2>
    <p>${greeting}</p>
    <p>${body}</p>
  </div>`;

  return { subject, html };
}

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
  const locale = payload.locale === "en" ? "en" : "ar";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildEmail(name || (locale === "en" ? "there" : "بك"), locale);

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
