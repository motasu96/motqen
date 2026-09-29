import { SupabaseClient } from "@supabase/supabase-js";

// Maps a program to the specialty label(s) a teacher must have to teach it
// — the same free-text labels used on the "join as teacher" application
// form (specialtyHifz/specialtyTajweed/etc. in messages/*.json).
export const PROGRAM_SPECIALTY_MAP: Record<string, string[]> = {
  "hifz-mutqan": ["حفظ القرآن"],
  "tilawa-tajweed": ["تلاوة وتجويد"],
  "muraja-hifz": ["حفظ القرآن"],
  "qiraat-ashr": ["قراءات وإجازة بسند"],
  "bara-em-mutqin": ["تعليم الأطفال"],
  "barnamej-nisaa": ["تعليم النساء"],
};

export type MatchedGroup = {
  id: string;
  title: string;
  titleEn: string | null;
  dayOfWeek: number;
  sessionTime: string;
  capacity: number;
  enrolledCount: number;
  teacherId: string;
  teacherName: string;
};

// Group circles whose day matches one of the student's preferred days and
// whose program matches what the student chose. Readable while signed out
// (see migration 0026) since this runs during signup, before the
// student's account exists yet.
export async function findMatchingGroups(
  supabase: SupabaseClient,
  params: { days: number[]; programSlug: string }
): Promise<MatchedGroup[]> {
  if (params.days.length === 0 || !params.programSlug) return [];
  const { data } = await supabase
    .from("group_sessions")
    .select("id, title, title_en, day_of_week, session_time, capacity, teachers(id, name), group_enrollments(count)")
    .eq("program_slug", params.programSlug)
    .in("day_of_week", params.days);

  return (data ?? []).map((row) => {
    const teacher = row.teachers as unknown as { id: string; name: string } | { id: string; name: string }[] | null;
    const t = Array.isArray(teacher) ? teacher[0] : teacher;
    const enrollments = row.group_enrollments as unknown as { count: number }[] | undefined;
    return {
      id: row.id as string,
      title: row.title as string,
      titleEn: (row.title_en as string | null) ?? null,
      dayOfWeek: row.day_of_week as number,
      sessionTime: row.session_time as string,
      capacity: row.capacity as number,
      enrolledCount: enrollments?.[0]?.count ?? 0,
      teacherId: t?.id ?? "",
      teacherName: t?.name ?? "",
    };
  });
}

export type MatchedTeacher = {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  availableDays: number[];
};

// Active teachers whose declared available days overlap the student's
// preferred days and whose specialties cover the chosen program (and, for
// the women's program, who are female).
export async function findMatchingTeachers(
  supabase: SupabaseClient,
  params: { days: number[]; programSlug: string }
): Promise<MatchedTeacher[]> {
  if (params.days.length === 0 || !params.programSlug) return [];
  const specialties = PROGRAM_SPECIALTY_MAP[params.programSlug] ?? [];
  if (specialties.length === 0) return [];

  const { data } = await supabase
    .from("teachers")
    .select("id, slug, name, avatar_url, rating, available_days, specialties, gender")
    .eq("status", "active")
    .overlaps("specialties", specialties)
    .overlaps("available_days", params.days);

  type Row = {
    id: string;
    slug: string;
    name: string;
    avatar_url: string | null;
    rating: number;
    available_days: number[] | null;
    gender: "male" | "female";
  };
  let rows = (data ?? []) as Row[];
  if (params.programSlug === "barnamej-nisaa") rows = rows.filter((r) => r.gender === "female");

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    avatarUrl: r.avatar_url,
    rating: r.rating,
    availableDays: r.available_days ?? [],
  }));
}
