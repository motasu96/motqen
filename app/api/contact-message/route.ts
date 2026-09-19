import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildContactMessageEmail } from "@/lib/emails/contactMessageEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_EMAIL = "info@motqen.site";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service is not configured" }, { status: 501 });
  }

  let payload: { name?: unknown; phone?: unknown; email?: unknown; message?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim().slice(0, 30) : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 4000) : "";

  if (!name || !phone || !message || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildContactMessageEmail({ name, phone, email, message });

  try {
    const { error } = await resend.emails.send({
      from: "متقن | Motqen <info@motqen.site>",
      replyTo: email,
      to: OWNER_EMAIL,
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
