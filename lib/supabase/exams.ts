import { SupabaseClient } from "@supabase/supabase-js";

export type ExamStatus = "upcoming" | "completed";

export type ExamRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  exam_date: string;
  status: ExamStatus;
  score: number | null;
  max_score: number | null;
  created_at: string;
};

export async function listStudentExams(supabase: SupabaseClient, studentId: string): Promise<ExamRow[]> {
  const { data } = await supabase
    .from("exams")
    .select("*")
    .eq("student_id", studentId)
    .order("exam_date", { ascending: false });
  return (data as ExamRow[]) ?? [];
}

export type ExamWithStudent = ExamRow & { studentName: string };

export async function listTeacherExams(supabase: SupabaseClient, teacherId: string): Promise<ExamWithStudent[]> {
  const { data } = await supabase
    .from("exams")
    .select("*, profiles(full_name)")
    .eq("teacher_id", teacherId)
    .order("exam_date", { ascending: false });

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const studentName = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    return { ...(row as ExamRow), studentName: studentName || "" };
  });
}

export async function createExam(
  supabase: SupabaseClient,
  params: { studentId: string; teacherId: string; title: string; examDate: string }
): Promise<boolean> {
  const { error } = await supabase.from("exams").insert({
    student_id: params.studentId,
    teacher_id: params.teacherId,
    title: params.title,
    exam_date: params.examDate,
  });
  return !error;
}

export async function recordExamScore(
  supabase: SupabaseClient,
  id: string,
  score: number,
  maxScore: number
): Promise<boolean> {
  const { error } = await supabase.from("exams").update({ status: "completed", score, max_score: maxScore }).eq("id", id);
  return !error;
}
