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
  student_name: string;
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

const AR_JUZ_WORDS: Record<number, string> = { 1: "جزء واحد", 2: "جزءان" };

export function formatJuzCount(n: number): string {
  return AR_JUZ_WORDS[n] ?? `${n} جزءًا`;
}

export function certificateTitle(scope: CertScope): string {
  return scope === "khatm" ? "شهادة ختم القرآن الكريم" : "شهادة حفظ";
}

export function amountShort(scope: CertScope, juzCount: number | null): string {
  if (scope === "khatm") return "القرآن كاملًا";
  return formatJuzCount(juzCount ?? 0);
}
