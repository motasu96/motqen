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

export type StudentGroupAttendance = {
  id: string;
  groupId: string;
  sessionDate: string;
  attended: boolean;
  recitationFrom: string | null;
  recitationTo: string | null;
  grade: string | null;
  notes: string | null;
  groupTitle: string;
  teacherName: string;
};

// A student's own attendance history across every group circle they've
// ever attended, most recent first — merged with 1:1 lessons in the
// "الحصص" screen so a student who only joins group circles still sees a
// session history instead of an empty list.
export async function listStudentGroupAttendance(studentId: string): Promise<StudentGroupAttendance[]> {
  const { data } = await supabase
    .from("group_attendance")
    .select("id, group_id, session_date, attended, recitation_from, recitation_to, grade, notes, group_sessions(title, teachers(name))")
    .eq("student_id", studentId)
    .order("session_date", { ascending: false });

  type GroupInfo = { title: string; teachers: { name: string } | { name: string }[] | null };

  return (data ?? []).map((row) => {
    const group = row.group_sessions as unknown as GroupInfo | GroupInfo[] | null;
    const g = Array.isArray(group) ? group[0] : group;
    const teacher = g?.teachers;
    const teacherName = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
    return {
      id: row.id as string,
      groupId: row.group_id as string,
      sessionDate: row.session_date as string,
      attended: row.attended as boolean,
      recitationFrom: (row.recitation_from as string | null) ?? null,
      recitationTo: (row.recitation_to as string | null) ?? null,
      grade: (row.grade as string | null) ?? null,
      notes: (row.notes as string | null) ?? null,
      groupTitle: g?.title ?? "",
      teacherName: teacherName ?? "",
    };
  });
}
