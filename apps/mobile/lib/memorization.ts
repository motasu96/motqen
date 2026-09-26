import { supabase } from "./supabase";

export type MemorizationRecordRow = {
  id: string;
  student_id: string;
  title: string;
  pages: number;
  completed_date: string;
};

export async function listStudentMemorization(studentId: string): Promise<MemorizationRecordRow[]> {
  const { data } = await supabase
    .from("memorization_records")
    .select("*")
    .eq("student_id", studentId)
    .order("completed_date", { ascending: false });
  return (data as MemorizationRecordRow[]) ?? [];
}
