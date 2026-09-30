import { supabase } from "./supabase";

export type BookingRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  session_date: string;
  session_time: string;
  status: "confirmed" | "cancelled";
  created_at: string;
};

// Every confirmed slot already taken for this teacher in the given date
// range, keyed "date__time" — used to grey out unavailable slots before the
// student even tries to pick one.
export async function getTakenSlots(teacherId: string, fromDate: string, toDate: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("bookings")
    .select("session_date, session_time")
    .eq("teacher_id", teacherId)
    .eq("status", "confirmed")
    .gte("session_date", fromDate)
    .lte("session_date", toDate);
  return new Set((data ?? []).map((r) => `${r.session_date}__${r.session_time}`));
}

// "slot_taken" means someone else grabbed the same slot between the student
// picking it and confirming the hold — the table's unique constraint on
// (teacher_id, session_date, session_time) is what actually prevents the
// double-booking; this just reports it back cleanly.
export async function createBooking(params: {
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
}): Promise<{ booking: BookingRow | null; error: "slot_taken" | "unknown" | null }> {
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
    if (error.code === "23505") return { booking: null, error: "slot_taken" };
    return { booking: null, error: "unknown" };
  }
  return { booking: data as BookingRow, error: null };
}
