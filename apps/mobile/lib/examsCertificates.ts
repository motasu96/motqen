import { supabase } from "./supabase";

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

export async function listStudentExams(studentId: string): Promise<ExamRow[]> {
  const { data } = await supabase
    .from("exams")
    .select("*")
    .eq("student_id", studentId)
    .order("exam_date", { ascending: false });
  return (data as ExamRow[]) ?? [];
}

export const GRADE_LABEL_TEXT: Record<string, string> = {
  excellent_high: "ممتاز مرتفع",
  excellent: "ممتاز",
  very_good: "جيد جدًا",
  good: "جيد",
  pass: "مقبول",
};

export type CertScope = "parts" | "khatm";

export type CertificateRow = {
  id: string;
  certificate_number: string;
  student_id: string;
  teacher_name: string;
  scope: CertScope;
  program_slug: string | null;
  narration: string;
  juz_count: number | null;
  juz_names: string | null;
  grade_percent: number | null;
  grade_label: string | null;
  issued_at: string;
};

export async function listMyCertificates(studentId: string): Promise<CertificateRow[]> {
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("student_id", studentId)
    .order("issued_at", { ascending: false });
  return (data as CertificateRow[]) ?? [];
}
