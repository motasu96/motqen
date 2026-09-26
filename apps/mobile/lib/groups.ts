import { supabase } from "./supabase";

export type GroupSessionRow = {
  id: string;
  teacher_id: string;
  title: string;
  title_en: string | null;
  program_slug: string | null;
  course_slug: string | null;
  day_of_week: number;
  session_time: string;
  capacity: number;
  created_at: string;
};

export type GroupWithTeacher = GroupSessionRow & { teacherName: string; enrolledCount: number };

export async function listAllGroupsForStudents(): Promise<GroupWithTeacher[]> {
  const { data } = await supabase
    .from("group_sessions")
    .select("*, teachers(name), group_enrollments(count)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const teacher = row.teachers as unknown as { name: string } | { name: string }[] | null;
    const teacherName = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
    const enrollments = row.group_enrollments as unknown as { count: number }[] | undefined;
    return {
      ...(row as unknown as GroupSessionRow),
      teacherName: teacherName ?? "",
      enrolledCount: enrollments?.[0]?.count ?? 0,
    };
  });
}

export async function listMyGroupEnrollmentIds(studentId: string): Promise<Set<string>> {
  const { data } = await supabase.from("group_enrollments").select("group_id").eq("student_id", studentId);
  return new Set((data ?? []).map((r) => r.group_id as string));
}

export async function joinGroup(groupId: string, studentId: string): Promise<boolean> {
  const { error } = await supabase.from("group_enrollments").insert({ group_id: groupId, student_id: studentId });
  return !error;
}

export async function leaveGroup(groupId: string, studentId: string): Promise<boolean> {
  const { error } = await supabase.from("group_enrollments").delete().eq("group_id", groupId).eq("student_id", studentId);
  return !error;
}
