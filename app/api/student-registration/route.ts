import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// How long after account creation an unauthenticated registration call is
// still accepted (the signup page calls this within seconds of signUp).
const FRESH_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

async function sessionUserId(req: NextRequest): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const bearer = /^Bearer\s+(\S+)$/i.exec(req.headers.get("authorization") ?? "")?.[1];
  if (bearer) {
    const client = createSupabaseClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(bearer);
    return error ? null : (data.user?.id ?? null);
  }
  if (req.headers.get("sec-fetch-site") === "cross-site") return null;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.auth.getUser();
  return error ? null : (data.user?.id ?? null);
}

async function authorizeRegistration(
  req: NextRequest,
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<NextResponse | null> {
  const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Signed in as the account being registered: fine.
  if ((await sessionUserId(req)) === userId) return null;

  // Otherwise (email confirmation pending, so no session for the new account
  // yet): only a brand-new student account that has no student record. Ids are random UUIDs known only
  // to the person who just created the account, so this cannot be used to
  // overwrite an existing student, nor to touch a teacher or admin.
  const { data: created, error } = await admin.auth.admin.getUserById(userId);
  const user = created?.user;
  if (error || !user) return forbidden();
  if (Date.now() - new Date(user.created_at).getTime() > FRESH_ACCOUNT_WINDOW_MS) return forbidden();

  const { data: profile } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile && profile.role !== "student") return forbidden();

  const { data: existing } = await admin.from("students").select("id").eq("id", userId).maybeSingle();
  if (existing) return forbidden();

  return null;
}

export async function POST(req: NextRequest) {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: {
    userId?: unknown;
    gender?: unknown;
    age?: unknown;
    programSlug?: unknown;
    preferredDays?: unknown;
    preferredTime?: unknown;
    planDurationMonths?: unknown;
    alreadyMemorizedJuz?: unknown;
    reviewDaysPerWeek?: unknown;
    planDirection?: unknown;
    country?: unknown;
    city?: unknown;
    email?: unknown;
    groupId?: unknown;
    preferredTeacherId?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userId = typeof payload.userId === "string" ? payload.userId : "";
  const gender = payload.gender === "female" ? "female" : payload.gender === "male" ? "male" : null;
  const age = typeof payload.age === "number" && Number.isFinite(payload.age) ? Math.round(payload.age) : null;
  const programSlug = typeof payload.programSlug === "string" ? payload.programSlug.slice(0, 100) : null;
  const preferredDays = Array.isArray(payload.preferredDays)
    ? payload.preferredDays
        .filter((d): d is number | string => typeof d === "number" || typeof d === "string")
        .map((d) => String(d))
        .slice(0, 7)
    : [];
  const preferredTime = typeof payload.preferredTime === "string" ? payload.preferredTime.slice(0, 50) : null;
  const planDurationMonths =
    typeof payload.planDurationMonths === "number" && Number.isFinite(payload.planDurationMonths)
      ? Math.round(payload.planDurationMonths)
      : null;
  const alreadyMemorizedJuz =
    typeof payload.alreadyMemorizedJuz === "number" && Number.isFinite(payload.alreadyMemorizedJuz)
      ? Math.round(payload.alreadyMemorizedJuz)
      : 0;
  const reviewDaysPerWeek =
    typeof payload.reviewDaysPerWeek === "number" && Number.isFinite(payload.reviewDaysPerWeek)
      ? Math.round(payload.reviewDaysPerWeek)
      : null;
  const planDirection = typeof payload.planDirection === "string" ? payload.planDirection.slice(0, 20) : null;
  const country = typeof payload.country === "string" ? payload.country.slice(0, 10) : null;
  const city = typeof payload.city === "string" ? payload.city.slice(0, 100) : null;
  const email = typeof payload.email === "string" ? payload.email.slice(0, 200) : null;
  const groupId = typeof payload.groupId === "string" && UUID_RE.test(payload.groupId) ? payload.groupId : null;
  const preferredTeacherId =
    typeof payload.preferredTeacherId === "string" && UUID_RE.test(payload.preferredTeacherId)
      ? payload.preferredTeacherId
      : null;

  if (!userId || !UUID_RE.test(userId) || !gender) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // This route writes with the service-role key, so it must not trust the
  // `userId` the caller sends. Two legitimate callers exist:
  //  1. the signup page right after supabase.auth.signUp — with a session when
  //     email confirmation is off, without one when it is on;
  //  2. nobody else.
  const denied = await authorizeRegistration(req, supabase, userId);
  if (denied) return denied;

  const { error } = await supabase.from("students").upsert({
    id: userId,
    gender,
    age,
    program_slug: programSlug,
    preferred_days: preferredDays,
    preferred_time: preferredTime,
    plan_duration_months: planDurationMonths,
    already_memorized_juz: alreadyMemorizedJuz,
    review_days_per_week: reviewDaysPerWeek,
    plan_direction: planDirection,
    country,
    city,
    email,
    preferred_teacher_id: preferredTeacherId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  if (groupId) {
    await supabase.from("group_enrollments").upsert(
      { group_id: groupId, student_id: userId },
      { onConflict: "group_id,student_id" }
    );
  }

  return NextResponse.json({ ok: true });
}
