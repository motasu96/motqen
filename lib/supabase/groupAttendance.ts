import { SupabaseClient } from "@supabase/supabase-js";

export type GroupAttendanceRow = {
  id: string;
  group_id: string;
  teacher_id: string;
  student_id: string;
  session_date: string;
  attended: boolean;
  notes: string | null;
  created_at: string;
};

export type StudentAttendance = { attended: boolean; notes: string };

// All logged dates for a group, most recent first — backs the "already
// logged, tap to edit" list on the teacher's groups page.
export async function listGroupAttendanceDates(supabase: SupabaseClient, groupId: string): Promise<string[]> {
  const { data } = await supabase
    .from("group_attendance")
    .select("session_date")
    .eq("group_id", groupId)
    .order("session_date", { ascending: false });
  return Array.from(new Set((data ?? []).map((r) => r.session_date as string)));
}

// Per-student attendance already recorded for a group on a specific date,
// keyed by student id — empty map means nothing logged for that date yet.
export async function getGroupAttendanceForDate(
  supabase: SupabaseClient,
  groupId: string,
  sessionDate: string
): Promise<Map<string, StudentAttendance>> {
  const { data } = await supabase
    .from("group_attendance")
    .select("student_id, attended, notes")
    .eq("group_id", groupId)
    .eq("session_date", sessionDate);
  const byStudent = new Map<string, StudentAttendance>();
  for (const row of data ?? []) {
    byStudent.set(row.student_id as string, { attended: row.attended as boolean, notes: (row.notes as string | null) ?? "" });
  }
  return byStudent;
}

export async function saveGroupAttendance(
  supabase: SupabaseClient,
  params: {
    groupId: string;
    teacherId: string;
    sessionDate: string;
    records: { studentId: string; attended: boolean; notes: string }[];
  }
): Promise<boolean> {
  if (params.records.length === 0) return true;
  const { error } = await supabase.from("group_attendance").upsert(
    params.records.map((r) => ({
      group_id: params.groupId,
      teacher_id: params.teacherId,
      student_id: r.studentId,
      session_date: params.sessionDate,
      attended: r.attended,
      notes: r.notes || null,
    })),
    { onConflict: "group_id,student_id,session_date" }
  );
  return !error;
}
