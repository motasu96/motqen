import { supabase } from "./supabase";

export type Teacher = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  gender: "male" | "female";
  stats: {
    students: number;
    yearsExperience: number;
    completedSessions: number;
    rating: number;
  };
  specialties: string[];
};

type TeacherRow = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  gender: "male" | "female";
  specialties: string[];
  years_experience: number;
  students_count: number;
  completed_sessions: number;
  rating: number;
  status: "active" | "suspended";
};

function mapTeacherRow(row: TeacherRow): Teacher {
  return {
    slug: row.slug,
    name: row.name,
    title: row.title ?? "",
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? "",
    gender: row.gender,
    stats: {
      students: row.students_count,
      yearsExperience: row.years_experience,
      completedSessions: row.completed_sessions,
      rating: row.rating,
    },
    specialties: row.specialties ?? [],
  };
}

export async function getActiveTeachers(): Promise<Teacher[]> {
  const { data } = await supabase.from("teachers").select("*").eq("status", "active").order("created_at");
  return (data ?? []).map((row) => mapTeacherRow(row as TeacherRow));
}

export async function getTeacherBySlug(slug: string): Promise<Teacher | null> {
  const { data } = await supabase.from("teachers").select("*").eq("slug", slug).eq("status", "active").single();
  return data ? mapTeacherRow(data as TeacherRow) : null;
}

export async function getStudentPrimaryTeacher(studentId: string): Promise<{ id: string; name: string } | null> {
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
