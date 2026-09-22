import { SupabaseClient } from "@supabase/supabase-js";

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
  status: "regular" | "late" | "struggling";
};

// Status is derived from how recently the student last attended a lesson
// with this teacher — there's no explicit status field, so this is the
// honest signal we have. Sorted by most-recent session first.
export async function listTeacherRecentStudents(
  supabase: SupabaseClient,
  teacherId: string,
  limit = 4
): Promise<TeacherRecentStudent[]> {
  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("student_id, profiles(full_name)")
    .eq("teacher_id", teacherId);

  const nameById = new Map<string, string>();
  for (const row of bookingRows ?? []) {
    const profile = row.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    const studentId = row.student_id as string | null;
    if (studentId && !nameById.has(studentId)) {
      nameById.set(studentId, name || "");
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
    let status: TeacherRecentStudent["status"] = "struggling";
    if (lastSessionDate) {
      const days = (now - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24);
      status = days <= 14 ? "regular" : days <= 30 ? "late" : "struggling";
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
