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
  plan_started_at: string | null;
  country: string | null;
  city: string | null;
  email: string | null;
  preferred_teacher_id: string | null;
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

export type StudentFileProfile = {
  fullName: string | null;
  phone: string | null;
  student: StudentRow | null;
  preferredTeacherName: string | null;
};

// The full registration record for an arbitrary student — used by the
// teacher/admin "student file" view. Relies on existing RLS (teachers can
// read profiles/students rows for students who booked with them or joined
// their groups; admins can read all) rather than any new policy.
export async function getStudentFileProfile(supabase: SupabaseClient, studentId: string): Promise<StudentFileProfile> {
  const [{ data: profile }, { data: student }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", studentId).maybeSingle(),
    supabase.from("students").select("*").eq("id", studentId).maybeSingle(),
  ]);
  const row = (student as StudentRow | null) ?? null;
  let preferredTeacherName: string | null = null;
  if (row?.preferred_teacher_id) {
    const { data: teacher } = await supabase.from("teachers").select("name").eq("id", row.preferred_teacher_id).maybeSingle();
    preferredTeacherName = (teacher?.name as string | null) ?? null;
  }
  return {
    fullName: (profile?.full_name as string | null) ?? null,
    phone: (profile?.phone as string | null) ?? null,
    student: row,
    preferredTeacherName,
  };
}

export type StudentPlanInput = {
  durationMonths: number;
  alreadyMemorizedJuz: number;
  reviewDaysPerWeek: 1 | 2;
  direction: "fromStart" | "fromEnd";
};

// A teacher assesses the student's real level and sets/updates their
// memorization plan (see migration 0029 for the RLS letting a teacher
// write these specific columns). plan_started_at is reset to now so the
// weekly-progress calculation paces from when the plan was actually set,
// not the student's signup date.
export async function updateStudentPlan(supabase: SupabaseClient, studentId: string, input: StudentPlanInput): Promise<boolean> {
  const { error } = await supabase
    .from("students")
    .update({
      plan_duration_months: input.durationMonths,
      already_memorized_juz: input.alreadyMemorizedJuz,
      review_days_per_week: input.reviewDaysPerWeek,
      plan_direction: input.direction,
      plan_started_at: new Date().toISOString(),
    })
    .eq("id", studentId);
  return !error;
}

export type StudentPlanFields = {
  plan_duration_months: number | null;
  already_memorized_juz: number;
  review_days_per_week: number | null;
  plan_direction: string | null;
};

export async function getStudentPlan(supabase: SupabaseClient, studentId: string): Promise<StudentPlanFields | null> {
  const { data } = await supabase
    .from("students")
    .select("plan_duration_months, already_memorized_juz, review_days_per_week, plan_direction")
    .eq("id", studentId)
    .maybeSingle();
  return (data as StudentPlanFields | null) ?? null;
}
