import { SupabaseClient } from "@supabase/supabase-js";

export type HomeworkType = "recitation" | "review" | "tajweed";
export type HomeworkStatus = "pending" | "submitted" | "graded";

export type HomeworkRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  type: HomeworkType;
  due_date: string;
  status: HomeworkStatus;
  grade: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  created_at: string;
};

export async function listStudentHomework(supabase: SupabaseClient, studentId: string): Promise<HomeworkRow[]> {
  const { data } = await supabase
    .from("homework")
    .select("*")
    .eq("student_id", studentId)
    .order("due_date", { ascending: false });
  return (data as HomeworkRow[]) ?? [];
}

export async function markHomeworkSubmitted(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase
    .from("homework")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  return !error;
}

export type HomeworkWithStudent = HomeworkRow & { studentName: string };

export async function listTeacherHomework(supabase: SupabaseClient, teacherId: string): Promise<HomeworkWithStudent[]> {
  const { data } = await supabase
    .from("homework")
    .select("*, profiles(full_name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const studentName = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    return { ...(row as HomeworkRow), studentName: studentName || "" };
  });
}

export async function assignHomework(
  supabase: SupabaseClient,
  params: { studentId: string; teacherId: string; title: string; type: HomeworkType; dueDate: string }
): Promise<boolean> {
  const { error } = await supabase.from("homework").insert({
    student_id: params.studentId,
    teacher_id: params.teacherId,
    title: params.title,
    type: params.type,
    due_date: params.dueDate,
  });
  return !error;
}

export async function gradeHomework(supabase: SupabaseClient, id: string, grade: string): Promise<boolean> {
  const { error } = await supabase
    .from("homework")
    .update({ status: "graded", grade, graded_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}
