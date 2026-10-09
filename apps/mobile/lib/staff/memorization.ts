import { SupabaseClient } from "@supabase/supabase-js";

export type MemorizationRecordRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  pages: number;
  completed_date: string;
  created_at: string;
};

export async function listStudentMemorization(supabase: SupabaseClient, studentId: string): Promise<MemorizationRecordRow[]> {
  const { data } = await supabase
    .from("memorization_records")
    .select("*")
    .eq("student_id", studentId)
    .order("completed_date", { ascending: false });
  return (data as MemorizationRecordRow[]) ?? [];
}

export async function confirmMemorization(
  supabase: SupabaseClient,
  params: { studentId: string; teacherId: string; title: string; pages: number; completedDate: string }
): Promise<boolean> {
  const { error } = await supabase.from("memorization_records").insert({
    student_id: params.studentId,
    teacher_id: params.teacherId,
    title: params.title,
    pages: params.pages,
    completed_date: params.completedDate,
  });
  return !error;
}
