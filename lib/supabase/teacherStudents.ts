import { SupabaseClient } from "@supabase/supabase-js";

export type TeacherStudentOption = { id: string; name: string };

export async function getMyTeacherId(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await supabase.from("teachers").select("id").eq("profile_id", userId).maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export async function getMyAvailableTimes(supabase: SupabaseClient, teacherId: string): Promise<string[]> {
  const { data } = await supabase.from("teachers").select("available_times").eq("id", teacherId).single();
  return (data?.available_times as string[] | null) ?? [];
}

export async function updateMyAvailableTimes(
  supabase: SupabaseClient,
  teacherId: string,
  times: string[]
): Promise<boolean> {
  const { error } = await supabase.from("teachers").update({ available_times: times }).eq("id", teacherId);
  return !error;
}

// Which days of the week (0=Saturday..6=Friday, matching
// group_sessions.day_of_week) a teacher generally offers private 1:1
// lessons on — used to match students with compatible teachers at signup.
export async function getMyAvailableDays(supabase: SupabaseClient, teacherId: string): Promise<number[]> {
  const { data } = await supabase.from("teachers").select("available_days").eq("id", teacherId).single();
  return (data?.available_days as number[] | null) ?? [];
}

export async function updateMyAvailableDays(supabase: SupabaseClient, teacherId: string, days: number[]): Promise<boolean> {
  const { error } = await supabase.from("teachers").update({ available_days: days }).eq("id", teacherId);
  return !error;
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

// Students who picked this teacher privately at signup (students.preferred_teacher_id)
// but haven't booked a session yet — surfaced so the teacher can reach out.
// Callers should exclude ids already covered by listTeacherStudents to avoid
// showing the same student in both "my students" and "chose you" sections.
export async function listStudentsWhoPreferredMe(supabase: SupabaseClient, teacherId: string): Promise<TeacherStudentOption[]> {
  const { data } = await supabase
    .from("students")
    .select("id, profiles(full_name)")
    .eq("preferred_teacher_id", teacherId);

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    return { id: row.id as string, name: name || "" };
  });
}
