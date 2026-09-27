import { SupabaseClient } from "@supabase/supabase-js";

export type GroupAttendanceRow = {
  id: string;
  group_id: string;
  teacher_id: string;
  student_id: string;
  session_date: string;
  attended: boolean;
  recitation_from: string | null;
  recitation_to: string | null;
  grade: string | null;
  notes: string | null;
  created_at: string;
};

export type StudentAttendance = { attended: boolean; recitationFrom: string; recitationTo: string; grade: string; notes: string };

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
    .select("student_id, attended, recitation_from, recitation_to, grade, notes")
    .eq("group_id", groupId)
    .eq("session_date", sessionDate);
  const byStudent = new Map<string, StudentAttendance>();
  for (const row of data ?? []) {
    byStudent.set(row.student_id as string, {
      attended: row.attended as boolean,
      recitationFrom: (row.recitation_from as string | null) ?? "",
      recitationTo: (row.recitation_to as string | null) ?? "",
      grade: (row.grade as string | null) ?? "",
      notes: (row.notes as string | null) ?? "",
    });
  }
  return byStudent;
}

export async function saveGroupAttendance(
  supabase: SupabaseClient,
  params: {
    groupId: string;
    teacherId: string;
    sessionDate: string;
    records: { studentId: string; attended: boolean; recitationFrom: string; recitationTo: string; grade: string; notes: string }[];
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
      recitation_from: r.attended ? r.recitationFrom || null : null,
      recitation_to: r.attended ? r.recitationTo || null : null,
      grade: r.attended ? r.grade || null : null,
      notes: r.notes || null,
    })),
    { onConflict: "group_id,student_id,session_date" }
  );
  return !error;
}
