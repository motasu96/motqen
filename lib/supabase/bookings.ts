import { SupabaseClient } from "@supabase/supabase-js";

export type BookingRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  session_date: string;
  session_time: string;
  status: "confirmed" | "cancelled";
  created_at: string;
};

export type UpcomingBooking = {
  id: string;
  date: string;
  time: string;
  teacherName: string;
};

export async function getTakenSlots(
  supabase: SupabaseClient,
  teacherId: string,
  fromDate: string,
  toDate: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from("bookings")
    .select("session_date, session_time")
    .eq("teacher_id", teacherId)
    .eq("status", "confirmed")
    .gte("session_date", fromDate)
    .lte("session_date", toDate);
  return new Set((data ?? []).map((r) => `${r.session_date}__${r.session_time}`));
}

export async function createBooking(
  supabase: SupabaseClient,
  params: { studentId: string; teacherId: string; date: string; time: string }
): Promise<{ booking: BookingRow | null; error: "slot_taken" | "unknown" | null }> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      student_id: params.studentId,
      teacher_id: params.teacherId,
      session_date: params.date,
      session_time: params.time,
    })
    .select("*")
    .single();

  if (error) {
    // Postgres unique_violation
    if (error.code === "23505") return { booking: null, error: "slot_taken" };
    return { booking: null, error: "unknown" };
  }
  return { booking: data as BookingRow, error: null };
}

export async function listUpcomingBookings(supabase: SupabaseClient, studentId: string): Promise<UpcomingBooking[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("bookings")
    .select("id, session_date, session_time, teachers(name)")
    .eq("student_id", studentId)
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

export async function cancelBooking(supabase: SupabaseClient, bookingId: string): Promise<boolean> {
  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
  return !error;
}
