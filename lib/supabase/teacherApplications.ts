import { SupabaseClient } from "@supabase/supabase-js";
import { generateUniqueSlug } from "./teachers";

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

// Approves an application: creates the public teacher row, marks the
// application approved, and kicks off real account creation (email +
// password-setup link) server-side. Account creation is fire-and-forget
// from here since the admin already sees the new "current teachers" row;
// the "resend setup email" button covers recovery if it silently fails.
export async function approveApplication(supabase: SupabaseClient, app: TeacherApplication): Promise<boolean> {
  const slug = await generateUniqueSlug(supabase, app.full_name);

  const { data: inserted, error: insertError } = await supabase
    .from("teachers")
    .insert({
      slug,
      name: app.full_name,
      gender: app.gender,
      specialties: app.specialties,
      years_experience: app.years_experience ?? 0,
      bio: app.bio,
      avatar_url: app.photo_url,
      application_id: app.id,
      status: "active",
    })
    .select("id")
    .single();

  if (insertError || !inserted) return false;

  await supabase
    .from("teacher_applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", app.id);

  fetch("/api/teacher-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherRowId: inserted.id, name: app.full_name, email: app.email, phone: app.phone, slug }),
  }).catch(() => {});

  return true;
}

export async function rejectApplication(supabase: SupabaseClient, app: TeacherApplication): Promise<boolean> {
  const { error } = await supabase
    .from("teacher_applications")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", app.id);
  return !error;
}
