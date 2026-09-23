import { SupabaseClient } from "@supabase/supabase-js";

export type GroupSessionRow = {
  id: string;
  teacher_id: string;
  title: string;
  title_en: string | null;
  program_slug: string | null;
  day_of_week: number;
  session_time: string;
  capacity: number;
  created_at: string;
};

export type GroupMember = { id: string; name: string };

export type GroupWithMembers = GroupSessionRow & {
  teacherName: string;
  enrolledCount: number;
  enrolledNames: string[];
  enrolledMembers: GroupMember[];
};

async function attachMembers(
  supabase: SupabaseClient,
  groups: (GroupSessionRow & { teacherName: string })[]
): Promise<GroupWithMembers[]> {
  if (groups.length === 0) return [];
  const ids = groups.map((g) => g.id);
  const { data: enrollments } = await supabase
    .from("group_enrollments")
    .select("group_id, student_id, profiles(full_name)")
    .in("group_id", ids);

  const membersByGroup = new Map<string, GroupMember[]>();
  for (const e of enrollments ?? []) {
    const profile = e.profiles as unknown as { full_name: string | null } | { full_name: string | null }[] | null;
    const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
    const groupId = e.group_id as string;
    const arr = membersByGroup.get(groupId) ?? [];
    arr.push({ id: e.student_id as string, name: name || "" });
    membersByGroup.set(groupId, arr);
  }

  return groups.map((g) => {
    const members = membersByGroup.get(g.id) ?? [];
    return { ...g, enrolledCount: members.length, enrolledNames: members.map((m) => m.name), enrolledMembers: members };
  });
}

export async function listAllGroupsForStudents(supabase: SupabaseClient): Promise<GroupWithMembers[]> {
  const { data } = await supabase
    .from("group_sessions")
    .select("*, teachers(name)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []).map((row) => {
    const teacher = row.teachers as unknown as { name: string } | { name: string }[] | null;
    const teacherName = Array.isArray(teacher) ? teacher[0]?.name : teacher?.name;
    return { ...(row as GroupSessionRow), teacherName: teacherName ?? "" };
  });
  return attachMembers(supabase, rows);
}

export async function listTeacherGroups(supabase: SupabaseClient, teacherId: string): Promise<GroupWithMembers[]> {
  const { data } = await supabase
    .from("group_sessions")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  const rows = ((data ?? []) as GroupSessionRow[]).map((r) => ({ ...r, teacherName: "" }));
  return attachMembers(supabase, rows);
}

export async function createGroup(
  supabase: SupabaseClient,
  params: {
    teacherId: string;
    title: string;
    titleEn: string;
    programSlug: string;
    dayOfWeek: number;
    sessionTime: string;
    capacity: number;
  }
): Promise<boolean> {
  const { error } = await supabase.from("group_sessions").insert({
    teacher_id: params.teacherId,
    title: params.title,
    title_en: params.titleEn || null,
    program_slug: params.programSlug || null,
    day_of_week: params.dayOfWeek,
    session_time: params.sessionTime,
    capacity: params.capacity,
  });
  return !error;
}

export async function deleteGroup(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase.from("group_sessions").delete().eq("id", id);
  return !error;
}

export async function joinGroup(supabase: SupabaseClient, groupId: string, studentId: string): Promise<boolean> {
  const { error } = await supabase.from("group_enrollments").insert({ group_id: groupId, student_id: studentId });
  return !error;
}

export async function leaveGroup(supabase: SupabaseClient, groupId: string, studentId: string): Promise<boolean> {
  const { error } = await supabase.from("group_enrollments").delete().eq("group_id", groupId).eq("student_id", studentId);
  return !error;
}

export async function listMyGroupEnrollmentIds(supabase: SupabaseClient, studentId: string): Promise<Set<string>> {
  const { data } = await supabase.from("group_enrollments").select("group_id").eq("student_id", studentId);
  return new Set((data ?? []).map((r) => r.group_id as string));
}
