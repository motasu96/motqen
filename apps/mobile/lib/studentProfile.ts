import { supabase } from "./supabase";

export type StudentRow = {
  id: string;
  program_slug: string | null;
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

export async function getMyStudentProfile(userId: string): Promise<MyStudentProfile> {
  const [{ data: profile }, { data: student }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).single(),
    supabase.from("students").select("*").eq("id", userId).maybeSingle(),
  ]);
  return {
    fullName: (profile?.full_name as string | null) ?? null,
    student: (student as StudentRow | null) ?? null,
  };
}

export type UpcomingBooking = {
  id: string;
  date: string;
  time: string;
  teacherName: string;
};

export async function listUpcomingBookings(userId: string): Promise<UpcomingBooking[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("bookings")
    .select("id, session_date, session_time, teachers(name)")
    .eq("student_id", userId)
    .eq("status", "confirmed")
    .gte("session_date", today)
    .order("session_date", { ascending: true })
    .order("session_time", { ascending: true });

  return (data ?? []).map((row) => {
    const teacher = row.teachers as unknown as { name: string } | { name: string }[] | null;
    const teacherName = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
    return {
      id: row.id as string,
      date: row.session_date as string,
      time: row.session_time as string,
      teacherName: teacherName ?? "",
    };
  });
}

export async function cancelBooking(bookingId: string): Promise<boolean> {
  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
  return !error;
}
