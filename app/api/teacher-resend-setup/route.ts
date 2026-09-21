import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildTeacherApprovedEmail } from "@/lib/emails/teacherApprovedEmail";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE_URL = "https://www.motqen.site";

// Lets an admin resend a teacher's account-setup email (e.g. the first one
// was lost). Looks up the teacher's real login email via their linked auth
// user rather than the original application, since that stays correct even
// if the application row changes.
export async function POST(req: NextRequest) {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: { teacherRowId?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const teacherRowId = typeof payload.teacherRowId === "string" ? payload.teacherRowId : "";
  if (!teacherRowId || !UUID_RE.test(teacherRowId)) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .select("id, name, slug, profile_id")
    .eq("id", teacherRowId)
    .single();

  if (teacherError || !teacher || !teacher.profile_id) {
    return NextResponse.json({ error: "Teacher account not found" }, { status: 404 });
  }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(teacher.profile_id);
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: userError?.message ?? "Failed to look up account email" }, { status: 502 });
  }
  const email = userData.user.email;

  const { data: linkData, error: genLinkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${SITE_URL}/reset-password` },
  });
  if (genLinkError || !linkData.properties?.action_link) {
    return NextResponse.json({ error: genLinkError?.message ?? "Failed to generate setup link" }, { status: 502 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email sending is not configured" }, { status: 501 });
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildTeacherApprovedEmail({
    name: teacher.name,
    profileUrl: `${SITE_URL}/teachers/${teacher.slug}`,
    setupLink: linkData.properties.action_link,
  });

  try {
    await resend.emails.send({ from: "متقن | Motqen <info@motqen.site>", to: email, subject, html });
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
