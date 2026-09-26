import { supabase } from "./supabase";

export type AttendanceStats = { attended: number; total: number; percent: number };

export async function getAttendanceStats(studentId: string): Promise<AttendanceStats> {
  const { data } = await supabase.from("lessons").select("attended").eq("student_id", studentId);
  const total = data?.length ?? 0;
  const attended = data?.filter((r) => r.attended).length ?? 0;
  return { attended, total, percent: total > 0 ? Math.round((attended / total) * 100) : 0 };
}

export type LessonRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  session_date: string;
  surah: string | null;
  ayah_range: string | null;
  notes: string | null;
  attended: boolean;
};

export type LessonWithTeacher = LessonRow & { teacherName: string };

function mapLessonRow(row: Record<string, unknown>): LessonWithTeacher {
  const teacher = row.teachers as unknown as { name: string } | { name: string }[] | null;
  const teacherName = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
  return { ...(row as LessonRow), teacherName: teacherName ?? "" };
}

export async function getLatestLesson(studentId: string): Promise<LessonWithTeacher | null> {
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

export async function listStudentLessons(studentId: string): Promise<LessonWithTeacher[]> {
  const { data } = await supabase
    .from("lessons")
    .select("*, teachers(name)")
    .eq("student_id", studentId)
    .order("session_date", { ascending: false });
  return (data ?? []).map(mapLessonRow);
}
