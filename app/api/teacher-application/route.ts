import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildTeacherApplicationEmail } from "@/lib/emails/teacherApplicationEmail";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_EMAIL = "info@motqen.site";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!apiKey && !hasSupabase) {
    return NextResponse.json({ error: "No submission channel is configured" }, { status: 501 });
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
    photoUrl?: unknown;
    certificatePath?: unknown;
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
  const photoUrl = typeof payload.photoUrl === "string" ? payload.photoUrl.slice(0, 500) : null;
  const certificatePath = typeof payload.certificatePath === "string" ? payload.certificatePath.slice(0, 500) : null;

  if (!name || !phone || !email || !EMAIL_RE.test(email) || !gender || !bio) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  let savedToDb = false;
  if (hasSupabase) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("teacher_applications").insert({
        full_name: name,
        phone,
        email,
        gender,
        specialties,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        ijazah: ijazah || null,
        bio,
        photo_url: photoUrl,
        certificate_path: certificatePath,
      });
      savedToDb = !error;
    } catch {
      savedToDb = false;
    }
  }

  let certificateSignedUrl: string | null = null;
  if (hasSupabase && certificatePath) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase.storage.from("teacher-certificates").createSignedUrl(certificatePath, 60 * 60 * 24 * 7);
      certificateSignedUrl = data?.signedUrl ?? null;
    } catch {
      certificateSignedUrl = null;
    }
  }

  let emailSent = false;
  if (apiKey) {
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
      photoUrl,
      certificateUrl: certificateSignedUrl,
    });
    try {
      const { error } = await resend.emails.send({
        from: "متقن | Motqen <info@motqen.site>",
        replyTo: email,
        to: OWNER_EMAIL,
        subject,
        html,
      });
      emailSent = !error;
    } catch {
      emailSent = false;
    }
  }

  if (!savedToDb && !emailSent) {
    return NextResponse.json({ error: "Failed to submit application" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
