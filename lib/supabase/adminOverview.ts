import { SupabaseClient } from "@supabase/supabase-js";
import { buildPlan, overallProgressPercent, weekIndexForDate } from "@/lib/quranPlan";

export type OverviewStat = {
  value: number;
  deltaPercent: number | null;
};

export type AdminOverviewStats = {
  monthlyBookings: OverviewStat;
  totalTeachers: OverviewStat;
  totalStudents: OverviewStat;
};

function monthBounds(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

async function countInRange(supabase: SupabaseClient, table: string, column: string, start: string, end: string) {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .gte(column, start)
    .lt(column, end);
  return count ?? 0;
}

async function countTotal(supabase: SupabaseClient, table: string) {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function getAdminOverviewStats(supabase: SupabaseClient): Promise<AdminOverviewStats> {
  const thisMonth = monthBounds(0);
  const lastMonth = monthBounds(1);

  const [
    bookingsThisMonth,
    bookingsLastMonth,
    totalTeachers,
    teachersThisMonth,
    teachersLastMonth,
    totalStudents,
    studentsThisMonth,
    studentsLastMonth,
  ] = await Promise.all([
    countInRange(supabase, "bookings", "created_at", thisMonth.start, thisMonth.end),
    countInRange(supabase, "bookings", "created_at", lastMonth.start, lastMonth.end),
    countTotal(supabase, "teachers"),
    countInRange(supabase, "teachers", "created_at", thisMonth.start, thisMonth.end),
    countInRange(supabase, "teachers", "created_at", lastMonth.start, lastMonth.end),
    countTotal(supabase, "students"),
    countInRange(supabase, "students", "created_at", thisMonth.start, thisMonth.end),
    countInRange(supabase, "students", "created_at", lastMonth.start, lastMonth.end),
  ]);

  return {
    monthlyBookings: { value: bookingsThisMonth, deltaPercent: deltaPercent(bookingsThisMonth, bookingsLastMonth) },
    totalTeachers: { value: totalTeachers, deltaPercent: deltaPercent(teachersThisMonth, teachersLastMonth) },
    totalStudents: { value: totalStudents, deltaPercent: deltaPercent(studentsThisMonth, studentsLastMonth) },
  };
}

export type AdminReportsData = {
  avgTeacherRating: number | null;
  avgStudentProgress: number | null;
  retentionRatePercent: number | null;
  newStudentsThisMonth: number;
  monthlyBookings: number[]; // oldest to newest, `monthsBack` entries ending this month
};

// Retention here means "attended at least one lesson in the last 30 days",
// out of all students who have ever had a lesson logged — the only signal
// we actually have, since there's no subscription/renewal concept yet.
export async function getReportsData(supabase: SupabaseClient, monthsBack = 5): Promise<AdminReportsData> {
  const thisMonth = monthBounds(0);

  const [{ data: teacherRows }, students, { data: recentLessons }, { count: totalStudentsWithLessons }] =
    await Promise.all([
      supabase.from("teachers").select("rating"),
      listAllStudents(supabase),
      supabase
        .from("lessons")
        .select("student_id")
        .eq("attended", true)
        .gte("session_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
      supabase.from("lessons").select("student_id", { count: "exact", head: true }).eq("attended", true),
    ]);

  const ratings = (teacherRows ?? []).map((r) => r.rating as number).filter((r) => typeof r === "number");
  const avgTeacherRating = ratings.length > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;

  const withProgress = students.filter((s) => s.progressPercent !== null);
  const avgStudentProgress =
    withProgress.length > 0
      ? Math.round(withProgress.reduce((sum, s) => sum + (s.progressPercent ?? 0), 0) / withProgress.length)
      : null;

  const activeStudentIds = new Set((recentLessons ?? []).map((l) => l.student_id as string));
  const studentsEverAttended = totalStudentsWithLessons && totalStudentsWithLessons > 0 ? await countDistinctStudentsWithLessons(supabase) : 0;
  const retentionRatePercent =
    studentsEverAttended > 0 ? Math.round((activeStudentIds.size / studentsEverAttended) * 100) : null;

  const newStudentsThisMonth = await countInRange(supabase, "students", "created_at", thisMonth.start, thisMonth.end);

  const monthlyBookings: number[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const { start, end } = monthBounds(i);
    monthlyBookings.push(await countInRange(supabase, "bookings", "created_at", start, end));
  }

  return { avgTeacherRating, avgStudentProgress, retentionRatePercent, newStudentsThisMonth, monthlyBookings };
}

async function countDistinctStudentsWithLessons(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase.from("lessons").select("student_id").eq("attended", true);
  return new Set((data ?? []).map((r) => r.student_id as string)).size;
}

export async function getEnrollmentByProgram(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data } = await supabase.from("students").select("program_slug");
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const slug = row.program_slug as string | null;
    if (!slug) continue;
    counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

export type AdminRecentStudent = {
  id: string;
  name: string;
  programSlug: string | null;
  teacherName: string;
  joinDate: string;
  progressPercent: number | null;
  status: "regular" | "late" | "struggling";
};

// Status is derived from how recently the student last attended a lesson —
// there's no explicit status field, so this is the honest signal we have.
// limit === undefined fetches every student (used by the admin students list).
async function fetchAdminStudents(supabase: SupabaseClient, limit?: number): Promise<AdminRecentStudent[]> {
  let query = supabase
    .from("students")
    .select("id, program_slug, created_at, already_memorized_juz, plan_duration_months, review_days_per_week, plan_direction, profiles(full_name)")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data: students } = await query;

  if (!students || students.length === 0) return [];
  const ids = students.map((s) => s.id as string);

  const [{ data: bookings }, { data: lessons }] = await Promise.all([
    supabase
      .from("bookings")
      .select("student_id, session_date, teachers(name)")
      .in("student_id", ids)
      .eq("status", "confirmed")
      .order("session_date", { ascending: false }),
    supabase
      .from("lessons")
      .select("student_id, session_date")
      .in("student_id", ids)
      .eq("attended", true)
      .order("session_date", { ascending: false }),
  ]);

  const teacherByStudent = new Map<string, string>();
  for (const b of bookings ?? []) {
    const studentId = b.student_id as string;
    if (teacherByStudent.has(studentId)) continue;
    const teacher = b.teachers as unknown as { name: string } | { name: string }[] | null;
    const name = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
    teacherByStudent.set(studentId, name ?? "");
  }

  const lastAttendedByStudent = new Map<string, string>();
  for (const l of lessons ?? []) {
    const studentId = l.student_id as string;
    if (!lastAttendedByStudent.has(studentId)) {
      lastAttendedByStudent.set(studentId, l.session_date as string);
    }
  }

  const now = Date.now();
  return students.map((s) => {
    const profile = s.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    const lastAttended = lastAttendedByStudent.get(s.id as string);
    let status: AdminRecentStudent["status"] = "struggling";
    if (lastAttended) {
      const days = (now - new Date(lastAttended).getTime()) / (1000 * 60 * 60 * 24);
      status = days <= 14 ? "regular" : days <= 30 ? "late" : "struggling";
    }

    let progressPercent: number | null = null;
    if (s.plan_duration_months) {
      const plan = buildPlan({
        durationMonths: s.plan_duration_months as number,
        alreadyMemorizedJuz: s.already_memorized_juz as number,
        reviewDaysPerWeek: (s.review_days_per_week === 2 ? 2 : 1) as 1 | 2,
        direction: s.plan_direction === "fromStart" ? "fromStart" : "fromEnd",
      });
      const weekIndex = weekIndexForDate(plan, new Date(s.created_at as string), new Date());
      progressPercent = overallProgressPercent(plan, weekIndex);
    }

    return {
      id: s.id as string,
      name: name || "",
      programSlug: s.program_slug as string | null,
      teacherName: teacherByStudent.get(s.id as string) ?? "",
      joinDate: s.created_at as string,
      progressPercent,
      status,
    };
  });
}

export async function listRecentStudents(supabase: SupabaseClient, limit = 5): Promise<AdminRecentStudent[]> {
  return fetchAdminStudents(supabase, limit);
}

export async function listAllStudents(supabase: SupabaseClient): Promise<AdminRecentStudent[]> {
  return fetchAdminStudents(supabase);
}
