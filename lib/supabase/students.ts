import { SupabaseClient } from "@supabase/supabase-js";

export type StudentRow = {
  id: string;
  gender: "male" | "female";
  age: number | null;
  program_slug: string | null;
  preferred_days: string[];
  preferred_time: string | null;
  plan_duration_months: number | null;
  already_memorized_juz: number;
  review_days_per_week: number | null;
  plan_direction: string | null;
  created_at: string;
};

export type MyStudentProfile = {
  fullName: string | null;
  student: StudentRow | null;
};

export async function getMyStudentProfile(supabase: SupabaseClient, userId: string): Promise<MyStudentProfile> {
  const [{ data: profile }, { data: student }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).single(),
    supabase.from("students").select("*").eq("id", userId).maybeSingle(),
  ]);
  return {
    fullName: (profile?.full_name as string | null) ?? null,
    student: (student as StudentRow | null) ?? null,
  };
}
