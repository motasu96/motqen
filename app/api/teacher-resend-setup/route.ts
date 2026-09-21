import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildTeacherApprovedEmail } from "@/lib/emails/teacherApprovedEmail";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE_URL = "https://www.motqen.site";

type AdminClient = ReturnType<typeof createAdminClient>;

// Finds an existing auth user by email. The admin SDK has no direct
// getUserByEmail, so this pages through listUsers (fine at our user counts).
async function findUserIdByEmail(supabase: AdminClient, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

// Lets an admin (re)send a teacher's account-setup email — e.g. the first
// one was lost, or account creation silently failed at approval time and
// the teacher row was left with no linked auth user. In the latter case
// this route creates the missing account (using the email/phone from the
// original application) before sending, so the button is self-healing.
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
    .select("id, name, slug, profile_id, application_id")
    .eq("id", teacherRowId)
    .single();

  if (teacherError || !teacher) {
    console.error("[teacher-resend-setup] teacher lookup failed", { teacherRowId, teacherError });
    return NextResponse.json({ error: "Teacher not found", reason: "no_teacher" }, { status: 404 });
  }

  let profileId = teacher.profile_id as string | null;
  let email: string | null = null;

  if (profileId) {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profileId);
    if (userError || !userData.user?.email) {
      console.error("[teacher-resend-setup] getUserById failed", { profileId, userError });
      return NextResponse.json({ error: userError?.message ?? "Failed to look up account email", reason: "lookup" }, { status: 502 });
    }
    email = userData.user.email;
  } else {
    // No account linked yet (likely a silent failure at approval time). Look
    // up the original application to recover the email/phone and create one now.
    if (!teacher.application_id) {
      console.error("[teacher-resend-setup] no profile_id and no application_id", { teacherRowId });
      return NextResponse.json({ error: "No account or application found for this teacher", reason: "no_email" }, { status: 404 });
    }
    const { data: application, error: applicationError } = await supabase
      .from("teacher_applications")
      .select("email, phone")
      .eq("id", teacher.application_id)
      .single();
    if (applicationError || !application?.email) {
      console.error("[teacher-resend-setup] application lookup failed", { applicationId: teacher.application_id, applicationError });
      return NextResponse.json({ error: "No account or application found for this teacher", reason: "no_email" }, { status: 404 });
    }

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: application.email,
      email_confirm: true,
      password: crypto.randomUUID(),
      user_metadata: { role: "teacher", full_name: teacher.name, phone: application.phone },
    });

    if (createError || !created.user) {
      // Email may already have an auth account (e.g. a previous partial run created it
      // but the teachers row update failed) — recover its id instead of failing.
      const existingId = await findUserIdByEmail(supabase, application.email);
      if (!existingId) {
        console.error("[teacher-resend-setup] createUser failed", { email: application.email, createError });
        return NextResponse.json({ error: createError?.message ?? "Failed to create account", reason: "create" }, { status: 502 });
      }
      profileId = existingId;
    } else {
      profileId = created.user.id;
    }

    const { error: linkError } = await supabase.from("teachers").update({ profile_id: profileId }).eq("id", teacherRowId);
    if (linkError) {
      console.error("[teacher-resend-setup] linking profile_id failed", { teacherRowId, profileId, linkError });
      return NextResponse.json({ error: linkError.message, reason: "link_profile" }, { status: 502 });
    }
    email = application.email;
  }

  if (!email) {
    console.error("[teacher-resend-setup] no email resolved", { teacherRowId });
    return NextResponse.json({ error: "No account or application found for this teacher", reason: "no_email" }, { status: 404 });
  }

  const { data: linkData, error: genLinkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${SITE_URL}/reset-password` },
  });
  if (genLinkError || !linkData.properties?.action_link) {
    console.error("[teacher-resend-setup] generateLink failed", { email, genLinkError });
    return NextResponse.json({ error: genLinkError?.message ?? "Failed to generate setup link", reason: "link" }, { status: 502 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[teacher-resend-setup] RESEND_API_KEY missing");
    return NextResponse.json({ error: "Email sending is not configured", reason: "no_resend_key" }, { status: 501 });
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildTeacherApprovedEmail({
    name: teacher.name,
    profileUrl: `${SITE_URL}/teachers/${teacher.slug}`,
    setupLink: linkData.properties.action_link,
  });

  try {
    const sendResult = await resend.emails.send({ from: "متقن | Motqen <info@motqen.site>", to: email, subject, html });
    if (sendResult.error) {
      console.error("[teacher-resend-setup] resend.emails.send returned error", sendResult.error);
      return NextResponse.json({ error: sendResult.error.message, reason: "send" }, { status: 502 });
    }
  } catch (err) {
    console.error("[teacher-resend-setup] resend.emails.send threw", err);
    return NextResponse.json({ error: "Failed to send email", reason: "send" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
