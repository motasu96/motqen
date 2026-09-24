import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Payload = {
  teacherRowId?: unknown;
  name?: unknown;
  name_en?: unknown;
  title?: unknown;
  title_en?: unknown;
  bio?: unknown;
  bio_en?: unknown;
  specialties?: unknown;
  specialties_en?: unknown;
  years_experience?: unknown;
  students_count?: unknown;
  completed_sessions?: unknown;
  rating?: unknown;
  status?: unknown;
  avatar_url?: unknown;
};

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
}

// Only keys the caller actually sent are included, so a partial payload
// (e.g. just { avatar_url }) never clobbers the fields it left out.
function buildUpdate(payload: Payload): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  if (payload.name !== undefined) update.name = str(payload.name) ?? undefined;
  if (payload.name_en !== undefined) update.name_en = str(payload.name_en);
  if (payload.title !== undefined) update.title = str(payload.title);
  if (payload.title_en !== undefined) update.title_en = str(payload.title_en);
  if (payload.bio !== undefined) update.bio = str(payload.bio);
  if (payload.bio_en !== undefined) update.bio_en = str(payload.bio_en);
  if (payload.specialties !== undefined) update.specialties = strArray(payload.specialties);
  if (payload.specialties_en !== undefined) update.specialties_en = strArray(payload.specialties_en);
  if (payload.years_experience !== undefined) update.years_experience = Number(payload.years_experience) || 0;
  if (payload.students_count !== undefined) update.students_count = Number(payload.students_count) || 0;
  if (payload.completed_sessions !== undefined) update.completed_sessions = Number(payload.completed_sessions) || 0;
  if (payload.rating !== undefined) update.rating = Number(payload.rating) || 0;
  if (payload.status !== undefined) update.status = payload.status === "suspended" ? "suspended" : "active";
  if (payload.avatar_url !== undefined) update.avatar_url = str(payload.avatar_url);
  return update;
}

// A migration (0016_teacher_available_times.sql) revoked table-wide UPDATE
// on public.teachers from the "authenticated" Postgres role and re-granted
// it only for the available_times column, so a teacher can't overwrite
// their own rating/status/etc. Since the admin dashboard authenticates as
// the same "authenticated" role (admin-ness is an RLS/is_admin() check,
// not a separate DB role), that same column grant silently blocked every
// other field the admin tries to edit too — "permission denied for table
// teachers". This route does the update with the service-role client
// instead, which bypasses RLS and column grants entirely.
export async function POST(req: NextRequest) {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 501 });
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const teacherRowId = typeof payload.teacherRowId === "string" ? payload.teacherRowId : "";
  if (!teacherRowId || !UUID_RE.test(teacherRowId)) {
    return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
  }

  const update = buildUpdate(payload);
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("teachers").update(update).eq("id", teacherRowId);

  if (error) {
    console.error("[admin-teacher-update] update failed", { teacherRowId, error });
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
