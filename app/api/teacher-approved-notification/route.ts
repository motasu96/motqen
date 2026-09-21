import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildTeacherApprovedEmail } from "@/lib/emails/teacherApprovedEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Called by the admin dashboard right after approving a teacher application.
// Lives server-side because it needs RESEND_API_KEY, which must never reach
// the browser.
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service is not configured" }, { status: 501 });
  }

  let payload: { name?: unknown; email?: unknown; slug?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const slug = typeof payload.slug === "string" ? payload.slug.trim().slice(0, 100) : "";

  if (!name || !email || !EMAIL_RE.test(email) || !slug) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const profileUrl = `https://www.motqen.site/teachers/${slug}`;
  const resend = new Resend(apiKey);
  const { subject, html } = buildTeacherApprovedEmail({ name, profileUrl });

  try {
    const { error } = await resend.emails.send({
      from: "متقن | Motqen <info@motqen.site>",
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
