import { SupabaseClient } from "@supabase/supabase-js";
import { buildPlan, overallProgressPercent, weekIndexForDate } from "@/lib/quranPlan";

export type TeacherOverviewStats = {
  totalStudents: number;
  todaySessions: number;
  pendingHomework: number;
  completedSessions: number;
};

export async function getTeacherOverviewStats(supabase: SupabaseClient, teacherId: string): Promise<TeacherOverviewStats> {
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: bookingRows }, { count: todaySessions }, { count: pendingHomework }, { count: completedSessions }] =
    await Promise.all([
      supabase.from("bookings").select("student_id").eq("teacher_id", teacherId),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("teacher_id", teacherId)
        .eq("status", "confirmed")
        .eq("session_date", today),
      supabase.from("homework").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("status", "submitted"),
      supabase.from("lessons").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("attended", true),
    ]);

  const totalStudents = new Set((bookingRows ?? []).map((r) => r.student_id as string)).size;

  return {
    totalStudents,
    todaySessions: todaySessions ?? 0,
    pendingHomework: pendingHomework ?? 0,
    completedSessions: completedSessions ?? 0,
  };
}

export type TeacherRecentStudent = {
  id: string;
  name: string;
  lastSessionDate: string | null;
  status: "regular" | "late" | "struggling" | "new";
};

const NEW_STUDENT_GRACE_DAYS = 14;

// Status is derived from how recently the student last attended a lesson
// with this teacher — there's no explicit status field, so this is the
// honest signal we have. A student who hasn't had a first logged lesson
// yet is "new" (not "struggling") for a grace period from their earliest
// booking, since a lesson simply not having happened yet isn't the same
// as falling behind. Sorted by most-recent session first.
export async function listTeacherRecentStudents(
  supabase: SupabaseClient,
  teacherId: string,
  limit = 4
): Promise<TeacherRecentStudent[]> {
  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("student_id, session_date, profiles(full_name)")
    .eq("teacher_id", teacherId);

  const nameById = new Map<string, string>();
  const firstBookingById = new Map<string, string>();
  for (const row of bookingRows ?? []) {
    const profile = row.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    const studentId = row.student_id as string | null;
    const sessionDate = row.session_date as string | null;
    if (!studentId) continue;
    if (!nameById.has(studentId)) nameById.set(studentId, name || "");
    if (sessionDate && (!firstBookingById.has(studentId) || sessionDate < firstBookingById.get(studentId)!)) {
      firstBookingById.set(studentId, sessionDate);
    }
  }

  const ids = Array.from(nameById.keys());
  if (ids.length === 0) return [];

  const { data: lessonRows } = await supabase
    .from("lessons")
    .select("student_id, session_date")
    .eq("teacher_id", teacherId)
    .eq("attended", true)
    .in("student_id", ids)
    .order("session_date", { ascending: false });

  const lastSessionByStudent = new Map<string, string>();
  for (const l of lessonRows ?? []) {
    const studentId = l.student_id as string;
    if (!lastSessionByStudent.has(studentId)) {
      lastSessionByStudent.set(studentId, l.session_date as string);
    }
  }

  const now = Date.now();
  const rows: TeacherRecentStudent[] = ids.map((id) => {
    const lastSessionDate = lastSessionByStudent.get(id) ?? null;
    let status: TeacherRecentStudent["status"];
    if (lastSessionDate) {
      const days = (now - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24);
      status = days <= 14 ? "regular" : days <= 30 ? "late" : "struggling";
    } else {
      const firstBooking = firstBookingById.get(id);
      const daysSinceJoined = firstBooking ? (now - new Date(firstBooking).getTime()) / (1000 * 60 * 60 * 24) : 0;
      status = daysSinceJoined <= NEW_STUDENT_GRACE_DAYS ? "new" : "struggling";
    }
    return { id, name: nameById.get(id) || "", lastSessionDate, status };
  });

  rows.sort((a, b) => {
    if (!a.lastSessionDate && !b.lastSessionDate) return 0;
    if (!a.lastSessionDate) return 1;
    if (!b.lastSessionDate) return -1;
    return b.lastSessionDate.localeCompare(a.lastSessionDate);
  });

  return rows.slice(0, limit);
}

function monthBounds(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export type TeacherReportsData = {
  avgStudentProgress: number | null;
  attendanceRatePercent: number | null;
  rating: number | null;
  completedThisMonth: number;
  weeklySessions: number[]; // oldest to newest, `weeksBack` entries ending this week
};

// Attendance rate is computed from lessons the teacher has explicitly
// logged (attended vs. absent) — the only honest signal available, since
// there's no separate "session happened" record beyond that.
export async function getTeacherReportsData(
  supabase: SupabaseClient,
  teacherId: string,
  weeksBack = 4
): Promise<TeacherReportsData> {
  const thisMonth = monthBounds(0);

  const [{ data: bookingRows }, { data: lessonRows }, { data: teacherRow }] = await Promise.all([
    supabase.from("bookings").select("student_id").eq("teacher_id", teacherId),
    supabase.from("lessons").select("attended, session_date").eq("teacher_id", teacherId),
    supabase.from("teachers").select("rating").eq("id", teacherId).maybeSingle(),
  ]);

  const studentIds = Array.from(new Set((bookingRows ?? []).map((r) => r.student_id as string)));
  let avgStudentProgress: number | null = null;
  if (studentIds.length > 0) {
    const { data: studentRows } = await supabase
      .from("students")
      .select("id, created_at, already_memorized_juz, plan_duration_months, review_days_per_week, plan_direction")
      .in("id", studentIds);
    const percents: number[] = [];
    for (const s of studentRows ?? []) {
      if (!s.plan_duration_months) continue;
      const plan = buildPlan({
        durationMonths: s.plan_duration_months as number,
        alreadyMemorizedJuz: s.already_memorized_juz as number,
        reviewDaysPerWeek: (s.review_days_per_week === 2 ? 2 : 1) as 1 | 2,
        direction: s.plan_direction === "fromStart" ? "fromStart" : "fromEnd",
      });
      const weekIndex = weekIndexForDate(plan, new Date(s.created_at as string), new Date());
      percents.push(overallProgressPercent(plan, weekIndex));
    }
    avgStudentProgress = percents.length > 0 ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : null;
  }

  const totalLogged = lessonRows?.length ?? 0;
  const attendedCount = lessonRows?.filter((r) => r.attended).length ?? 0;
  const attendanceRatePercent = totalLogged > 0 ? Math.round((attendedCount / totalLogged) * 100) : null;

  const completedThisMonth = (lessonRows ?? []).filter(
    (r) => r.attended && (r.session_date as string) >= thisMonth.start && (r.session_date as string) < thisMonth.end
  ).length;

  const weeklySessions: number[] = [];
  const now = new Date();
  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const startStr = weekStart.toISOString().slice(0, 10);
    const endStr = weekEnd.toISOString().slice(0, 10);
    weeklySessions.push(
      (lessonRows ?? []).filter((r) => r.attended && (r.session_date as string) >= startStr && (r.session_date as string) < endStr)
        .length
    );
  }

  return {
    avgStudentProgress,
    attendanceRatePercent,
    rating: (teacherRow?.rating as number | null | undefined) ?? null,
    completedThisMonth,
    weeklySessions,
  };
}
