import { SupabaseClient } from "@supabase/supabase-js";

export type TeacherStudentOption = { id: string; name: string };

export async function getMyTeacherId(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await supabase.from("teachers").select("id").eq("profile_id", userId).maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

// The real students a teacher has actually taught (anyone who booked a
// session with them), used to populate "assign homework to" pickers.
export async function listTeacherStudents(supabase: SupabaseClient, teacherId: string): Promise<TeacherStudentOption[]> {
  const { data } = await supabase
    .from("bookings")
    .select("student_id, profiles(full_name)")
    .eq("teacher_id", teacherId);

  const byId = new Map<string, string>();
  for (const row of data ?? []) {
    const profile = row.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    if (row.student_id && !byId.has(row.student_id as string)) {
      byId.set(row.student_id as string, name || "");
    }
  }
  return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
}
