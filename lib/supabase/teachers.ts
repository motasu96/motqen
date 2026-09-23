import { SupabaseClient } from "@supabase/supabase-js";
import { Teacher } from "@/data/teachers";

// Row shape of public.teachers, mapped into the same `Teacher` type the UI
// already renders (TeacherProfileTabs, Rating, localize()) so those
// components don't need to change.
export type TeacherRow = {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  title: string | null;
  title_en: string | null;
  bio: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  gender: "male" | "female";
  specialties: string[];
  specialties_en: string[];
  years_experience: number;
  students_count: number;
  completed_sessions: number;
  rating: number;
  status: "active" | "suspended";
};

export function mapTeacherRow(row: TeacherRow): Teacher {
  return {
    slug: row.slug,
    name: row.name,
    title: row.title ?? "",
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? "/icon.png",
    gender: row.gender,
    stats: {
      students: row.students_count,
      yearsExperience: row.years_experience,
      completedSessions: row.completed_sessions,
      rating: row.rating,
    },
    specialties: row.specialties ?? [],
    en: {
      name: row.name_en ?? row.name,
      title: row.title_en ?? row.title ?? "",
      bio: row.bio_en ?? row.bio ?? "",
      specialties: row.specialties_en?.length ? row.specialties_en : row.specialties ?? [],
    },
  };
}

export async function getActiveTeachers(supabase: SupabaseClient): Promise<Teacher[]> {
  const { data } = await supabase.from("teachers").select("*").eq("status", "active").order("created_at");
  return (data ?? []).map((row) => mapTeacherRow(row as TeacherRow));
}

export async function getTeacherBySlugFromDb(supabase: SupabaseClient, slug: string): Promise<Teacher | null> {
  const { data } = await supabase.from("teachers").select("*").eq("slug", slug).eq("status", "active").single();
  return data ? mapTeacherRow(data as TeacherRow) : null;
}

// Lightweight lookup used by the booking widget, which only needs the
// teacher's real database id (not exposed on the mapped `Teacher` shape).
export async function getTeacherBookingInfo(
  supabase: SupabaseClient,
  slug: string
): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase
    .from("teachers")
    .select("id, name")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  return data ? { id: data.id as string, name: data.name as string } : null;
}

// The teacher's own bookable times of day (canonical "HH:MM" values),
// used to populate the booking calendar's time-slot buttons.
export async function getTeacherAvailableTimes(supabase: SupabaseClient, teacherId: string): Promise<string[]> {
  const { data } = await supabase.from("teachers").select("available_times").eq("id", teacherId).single();
  return (data?.available_times as string[] | null) ?? [];
}

// The teacher a student is currently working with, used for the "direct
// entry" walk-in card — their most recent confirmed booking, past or
// upcoming. Returns null if the student has never booked a session.
export async function getStudentPrimaryTeacher(
  supabase: SupabaseClient,
  studentId: string
): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase
    .from("bookings")
    .select("teachers(id, name)")
    .eq("student_id", studentId)
    .eq("status", "confirmed")
    .order("session_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const teacher = data.teachers as unknown as { id: string; name: string } | { id: string; name: string }[] | null;
  const t = Array.isArray(teacher) ? teacher[0] : teacher;
  return t ? { id: t.id, name: t.name } : null;
}

const ARABIC_TO_LATIN: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h", و: "w",
  ي: "y", ى: "a", ة: "a", ء: "",
};

export function slugifyName(name: string): string {
  const transliterated = name
    .split("")
    .map((ch) => ARABIC_TO_LATIN[ch] ?? ch)
    .join("");
  const slug = transliterated
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "teacher";
}

export async function generateUniqueSlug(supabase: SupabaseClient, name: string): Promise<string> {
  const base = slugifyName(name);
  let candidate = base;
  let suffix = 2;
  while (true) {
    const { data } = await supabase.from("teachers").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
