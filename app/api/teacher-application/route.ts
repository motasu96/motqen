import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildTeacherApplicationEmail } from "@/lib/emails/teacherApplicationEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_EMAIL = "info@motqen.site";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email service is not configured" }, { status: 501 });
  }

  let payload: {
    name?: unknown;
    phone?: unknown;
    email?: unknown;
    gender?: unknown;
    specialties?: unknown;
    yearsExperience?: unknown;
    ijazah?: unknown;
    bio?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim().slice(0, 30) : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const gender = payload.gender === "female" ? "female" : payload.gender === "male" ? "male" : null;
  const specialties = Array.isArray(payload.specialties)
    ? payload.specialties.filter((s): s is string => typeof s === "string").slice(0, 10)
    : [];
  const yearsExperience = typeof payload.yearsExperience === "string" ? payload.yearsExperience.trim().slice(0, 20) : "";
  const ijazah = typeof payload.ijazah === "string" ? payload.ijazah.trim().slice(0, 2000) : "";
  const bio = typeof payload.bio === "string" ? payload.bio.trim().slice(0, 4000) : "";

  if (!name || !phone || !email || !EMAIL_RE.test(email) || !gender || !bio) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildTeacherApplicationEmail({
    name,
    phone,
    email,
    gender,
    specialties,
    yearsExperience,
    ijazah,
    bio,
  });

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
