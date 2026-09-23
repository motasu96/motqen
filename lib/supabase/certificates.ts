import { SupabaseClient } from "@supabase/supabase-js";

export type CertificateRow = {
  id: string;
  student_id: string;
  student_name: string;
  teacher_id: string;
  teacher_name: string;
  issued_by: string | null;
  issued_by_name: string;
  achievement: string;
  issued_at: string;
  created_at: string;
};

export type StudentForCertificate = {
  studentId: string;
  studentName: string;
  teacherId: string | null;
  teacherName: string;
};

// Every real student with their most recent confirmed booking's teacher,
// used to populate the admin's "issue a certificate" picker.
export async function listStudentsForCertificates(supabase: SupabaseClient): Promise<StudentForCertificate[]> {
  const { data: students } = await supabase
    .from("students")
    .select("id, profiles(full_name)")
    .order("created_at", { ascending: false });
  if (!students || students.length === 0) return [];
  const ids = students.map((s) => s.id as string);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("student_id, teacher_id, session_date, teachers(name)")
    .in("student_id", ids)
    .eq("status", "confirmed")
    .order("session_date", { ascending: false });

  const teacherByStudent = new Map<string, { id: string; name: string }>();
  for (const b of bookings ?? []) {
    const studentId = b.student_id as string;
    if (teacherByStudent.has(studentId)) continue;
    const teacher = b.teachers as unknown as { name: string } | { name: string }[] | null;
    const name = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
    teacherByStudent.set(studentId, { id: b.teacher_id as string, name: name ?? "" });
  }

  return students.map((s) => {
    const profile = s.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    const teacher = teacherByStudent.get(s.id as string);
    return {
      studentId: s.id as string,
      studentName: name || "",
      teacherId: teacher?.id ?? null,
      teacherName: teacher?.name ?? "",
    };
  });
}

export async function issueCertificate(
  supabase: SupabaseClient,
  params: {
    studentId: string;
    studentName: string;
    teacherId: string;
    teacherName: string;
    issuedBy: string;
    issuedByName: string;
    achievement: string;
    issuedAt: string;
  }
): Promise<boolean> {
  const { error } = await supabase.from("certificates").insert({
    student_id: params.studentId,
    student_name: params.studentName,
    teacher_id: params.teacherId,
    teacher_name: params.teacherName,
    issued_by: params.issuedBy,
    issued_by_name: params.issuedByName,
    achievement: params.achievement,
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
