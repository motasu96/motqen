import { SupabaseClient } from "@supabase/supabase-js";

export type TeacherApplication = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  gender: "male" | "female";
  specialties: string[];
  years_experience: number | null;
  ijazah: string | null;
  bio: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  photo_url: string | null;
  certificate_path: string | null;
};

export async function listPendingApplications(supabase: SupabaseClient): Promise<TeacherApplication[]> {
  const { data } = await supabase
    .from("teacher_applications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data as TeacherApplication[]) ?? [];
}

export async function rejectApplication(supabase: SupabaseClient, app: TeacherApplication): Promise<boolean> {
  const { error } = await supabase
    .from("teacher_applications")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", app.id);
  return !error;
}
