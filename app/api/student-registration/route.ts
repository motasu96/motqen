import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    ? payload.preferredDays.filter((d): d is string => typeof d === "string").slice(0, 7)
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

  if (!userId || !UUID_RE.test(userId) || !gender) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const supabase = createAdminClient();
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
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
