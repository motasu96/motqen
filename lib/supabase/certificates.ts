import { SupabaseClient } from "@supabase/supabase-js";

// Fixed grade-label scale (a dropdown, not free text, to keep certificates
// consistent). Stored as this canonical key; translated for display.
export const GRADE_LABELS = ["excellent_high", "excellent", "very_good", "good", "pass"] as const;
export type GradeLabel = (typeof GRADE_LABELS)[number];

export const GRADE_LABEL_TRANSLATION_KEYS: Record<GradeLabel, string> = {
  excellent_high: "gradeExcellentHigh",
  excellent: "gradeExcellent",
  very_good: "gradeVeryGood",
  good: "gradeGood",
  pass: "gradePass",
};

export type CertScope = "parts" | "khatm";
export type Gender = "male" | "female";

export type CertificateRow = {
  id: string;
  certificate_number: string;
  student_id: string;
  student_name: string;
  student_gender: Gender;
  teacher_id: string;
  teacher_name: string;
  teacher_gender: Gender;
  issued_by: string | null;
  issued_by_name: string;
  scope: CertScope;
  program_slug: string | null;
  narration: string;
  juz_count: number | null;
  grade_percent: number | null;
  grade_label: GradeLabel | null;
  issued_at: string;
  created_at: string;
};

// The public-verification-safe subset (what the `anon` role's column
// grant actually allows reading) — see migration 0020.
export type PublicCertificate = {
  certificate_number: string;
  student_name: string;
  scope: CertScope;
  juz_count: number | null;
  program_slug: string | null;
  narration: string;
  issued_at: string;
};

export type StudentForCertificate = {
  studentId: string;
  studentName: string;
  studentGender: Gender;
  teacherId: string | null;
  teacherName: string;
  teacherGender: Gender;
};

// Every real student with their most recent confirmed booking's teacher,
// used to populate the admin's "issue a certificate" picker.
export async function listStudentsForCertificates(supabase: SupabaseClient): Promise<StudentForCertificate[]> {
  const { data: students } = await supabase
    .from("students")
    .select("id, gender, profiles(full_name)")
    .order("created_at", { ascending: false });
  if (!students || students.length === 0) return [];
  const ids = students.map((s) => s.id as string);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("student_id, teacher_id, session_date, teachers(name, gender)")
    .in("student_id", ids)
    .eq("status", "confirmed")
    .order("session_date", { ascending: false });

  const teacherByStudent = new Map<string, { id: string; name: string; gender: Gender }>();
  for (const b of bookings ?? []) {
    const studentId = b.student_id as string;
    if (teacherByStudent.has(studentId)) continue;
    const teacher = b.teachers as unknown as { name: string; gender: Gender } | { name: string; gender: Gender }[] | null;
    const t = Array.isArray(teacher) ? teacher[0] : teacher;
    teacherByStudent.set(studentId, { id: b.teacher_id as string, name: t?.name ?? "", gender: t?.gender ?? "male" });
  }

  return students.map((s) => {
    const profile = s.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    const teacher = teacherByStudent.get(s.id as string);
    return {
      studentId: s.id as string,
      studentName: name || "",
      studentGender: (s.gender as Gender) ?? "male",
      teacherId: teacher?.id ?? null,
      teacherName: teacher?.name ?? "",
      teacherGender: teacher?.gender ?? "male",
    };
  });
}

export async function issueCertificate(
  supabase: SupabaseClient,
  params: {
    studentId: string;
    studentName: string;
    studentGender: Gender;
    teacherId: string;
    teacherName: string;
    teacherGender: Gender;
    issuedBy: string;
    issuedByName: string;
    scope: CertScope;
    programSlug: string | null;
    narration: string;
    juzCount: number | null;
    gradePercent: number | null;
    gradeLabel: GradeLabel | null;
    issuedAt: string;
  }
): Promise<boolean> {
  const { error } = await supabase.from("certificates").insert({
    student_id: params.studentId,
    student_name: params.studentName,
    student_gender: params.studentGender,
    teacher_id: params.teacherId,
    teacher_name: params.teacherName,
    teacher_gender: params.teacherGender,
    issued_by: params.issuedBy,
    issued_by_name: params.issuedByName,
    scope: params.scope,
    program_slug: params.programSlug,
    narration: params.narration,
    juz_count: params.juzCount,
    grade_percent: params.gradePercent,
    grade_label: params.gradeLabel,
    issued_at: params.issuedAt,
  });
  return !error;
}

export async function listAllCertificates(supabase: SupabaseClient): Promise<CertificateRow[]> {
  const { data } = await supabase.from("certificates").select("*").order("issued_at", { ascending: false });
  return (data as CertificateRow[]) ?? [];
}

export async function listMyCertificates(supabase: SupabaseClient, studentId: string): Promise<CertificateRow[]> {
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("student_id", studentId)
    .order("issued_at", { ascending: false });
  return (data as CertificateRow[]) ?? [];
}

export async function deleteCertificate(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase.from("certificates").delete().eq("id", id);
  return !error;
}

// Public lookup by certificate number — callable without auth (the
// `anon` role's column grant restricts this to non-sensitive fields
// regardless of what's selected here; see migration 0020).
export async function verifyCertificate(supabase: SupabaseClient, certificateNumber: string): Promise<PublicCertificate | null> {
  const { data } = await supabase
    .from("certificates")
    .select("certificate_number, student_name, scope, juz_count, program_slug, narration, issued_at")
    .eq("certificate_number", certificateNumber)
    .maybeSingle();
  return (data as PublicCertificate | null) ?? null;
}
