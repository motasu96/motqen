import { SupabaseClient } from "@supabase/supabase-js";

export type LessonRow = {
  id: string;
  booking_id: string | null;
  student_id: string;
  teacher_id: string;
  session_date: string;
  surah: string;
  ayah_range: string;
  notes: string | null;
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

// Booking ids that already have a logged lesson, so the teacher dashboard
// only offers "log this session" for sessions that still need it.
export async function getLoggedBookingIds(supabase: SupabaseClient, teacherId: string): Promise<Set<string>> {
  const { data } = await supabase.from("lessons").select("booking_id").eq("teacher_id", teacherId);
  return new Set((data ?? []).map((r) => r.booking_id).filter((id): id is string => Boolean(id)));
}

export async function createLesson(
  supabase: SupabaseClient,
  params: {
    bookingId: string | null;
    studentId: string;
    teacherId: string;
    sessionDate: string;
    surah: string;
    ayahRange: string;
    notes?: string;
  }
): Promise<boolean> {
  const { error } = await supabase.from("lessons").insert({
    booking_id: params.bookingId,
    student_id: params.studentId,
    teacher_id: params.teacherId,
    session_date: params.sessionDate,
    surah: params.surah,
    ayah_range: params.ayahRange,
    notes: params.notes || null,
  });
  return !error;
}
