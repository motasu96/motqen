import { supabase } from "./supabase";

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

export async function listStudentHomework(studentId: string): Promise<HomeworkRow[]> {
  const { data } = await supabase
    .from("homework")
    .select("*")
    .eq("student_id", studentId)
    .order("due_date", { ascending: false });
  return (data as HomeworkRow[]) ?? [];
}

export async function markHomeworkSubmitted(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("homework")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  return !error;
}
