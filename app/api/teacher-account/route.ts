import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildTeacherApprovedEmail } from "@/lib/emails/teacherApprovedEmail";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE_URL = "https://www.motqen.site";

// Called by the admin dashboard right after approving a teacher application.
// Creates (or reuses) the teacher's real login account, links it to their
// teachers row, and emails them a password-setup link. Lives server-side:
// account creation needs the Supabase service-role key, which must never
// reach the browser.
export async function POST(req: NextRequest) {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: { teacherRowId?: unknown; name?: unknown; email?: unknown; phone?: unknown; slug?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const teacherRowId = typeof payload.teacherRowId === "string" ? payload.teacherRowId : "";
  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim().slice(0, 30) : "";
  const slug = typeof payload.slug === "string" ? payload.slug.trim().slice(0, 100) : "";

  if (!teacherRowId || !UUID_RE.test(teacherRowId) || !name || !email || !EMAIL_RE.test(email) || !slug) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: { role: "teacher", full_name: name, phone },
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "Failed to create account" }, { status: 502 });
  }

  const { error: linkError } = await supabase.from("teachers").update({ profile_id: created.user.id }).eq("id", teacherRowId);
  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 502 });
  }

  const { data: linkData, error: genLinkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${SITE_URL}/reset-password` },
  });
  if (genLinkError || !linkData.properties?.action_link) {
    return NextResponse.json({ error: genLinkError?.message ?? "Failed to generate setup link" }, { status: 502 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    const { subject, html } = buildTeacherApprovedEmail({
      name,
      profileUrl: `${SITE_URL}/teachers/${slug}`,
      setupLink: linkData.properties.action_link,
    });
    try {
      await resend.emails.send({ from: "متقن | Motqen <info@motqen.site>", to: email, subject, html });
    } catch {
      // Account creation already succeeded; the admin can resend manually if needed.
    }
  }

  return NextResponse.json({ ok: true, userId: created.user.id });
}
