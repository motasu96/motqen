import { supabase } from "./supabase";

export type AttendanceStats = { attended: number; total: number; percent: number };

export async function getAttendanceStats(studentId: string): Promise<AttendanceStats> {
  const { data } = await supabase.from("lessons").select("attended").eq("student_id", studentId);
  const total = data?.length ?? 0;
  const attended = data?.filter((r) => r.attended).length ?? 0;
  return { attended, total, percent: total > 0 ? Math.round((attended / total) * 100) : 0 };
}
