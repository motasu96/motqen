import { SupabaseClient } from "@supabase/supabase-js";

export type LessonRow = {
  id: string;
  booking_id: string | null;
  student_id: string;
  teacher_id: string;
  session_date: string;
  surah: string | null;
  ayah_range: string | null;
  notes: string | null;
  attended: boolean;
  created_at: string;
};

export type LessonWithTeacher = LessonRow & { teacherName: string };

function mapLessonRow(row: Record<string, unknown>): LessonWithTeacher {
  const teacher = row.teachers as unknown as { name: string } | { name: string }[] | null;
  const teacherName = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
  return { ...(row as LessonRow), teacherName: teacherName ?? "" };
}

export async function getLatestLesson(supabase: SupabaseClient, studentId: string): Promise<LessonWithTeacher | null> {
  const { data } = await supabase
    .from("lessons")
    .select("*, teachers(name)")
    .eq("student_id", studentId)
    .eq("attended", true)
    .order("session_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapLessonRow(data) : null;
}

export async function listStudentLessons(supabase: SupabaseClient, studentId: string): Promise<LessonWithTeacher[]> {
  const { data } = await supabase
    .from("lessons")
    .select("*, teachers(name)")
    .eq("student_id", studentId)
    .order("session_date", { ascending: false });

  return (data ?? []).map(mapLessonRow);
}

// Full lesson rows for a teacher, keyed by booking id — used to show and
// let the teacher edit what they already logged for a past session.
export async function listTeacherLessonsByBooking(
  supabase: SupabaseClient,
  teacherId: string
): Promise<Map<string, LessonRow>> {
  const { data } = await supabase.from("lessons").select("*").eq("teacher_id", teacherId);
  const byBooking = new Map<string, LessonRow>();
  for (const row of (data as LessonRow[] | null) ?? []) {
    if (row.booking_id) byBooking.set(row.booking_id, row);
  }
  return byBooking;
}

export async function createLesson(
  supabase: SupabaseClient,
  params: {
    bookingId: string | null;
    studentId: string;
    teacherId: string;
    sessionDate: string;
    attended: boolean;
    surah?: string;
    ayahRange?: string;
    notes?: string;
  }
): Promise<boolean> {
  const { error } = await supabase.from("lessons").insert({
    booking_id: params.bookingId,
    student_id: params.studentId,
    teacher_id: params.teacherId,
    session_date: params.sessionDate,
    attended: params.attended,
    surah: params.attended ? params.surah || null : null,
    ayah_range: params.attended ? params.ayahRange || null : null,
    notes: params.notes || null,
  });
  return !error;
}

export async function updateLesson(
  supabase: SupabaseClient,
  id: string,
  params: { attended: boolean; surah?: string; ayahRange?: string; notes?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from("lessons")
    .update({
      attended: params.attended,
      surah: params.attended ? params.surah || null : null,
      ayah_range: params.attended ? params.ayahRange || null : null,
      notes: params.notes || null,
    })
    .eq("id", id);
  return !error;
}

export type AttendanceStats = { attended: number; total: number; percent: number };

export async function getAttendanceStats(supabase: SupabaseClient, studentId: string): Promise<AttendanceStats> {
  const { data } = await supabase.from("lessons").select("attended").eq("student_id", studentId);
  const total = data?.length ?? 0;
  const attended = data?.filter((r) => r.attended).length ?? 0;
  return { attended, total, percent: total > 0 ? Math.round((attended / total) * 100) : 0 };
}
