import { supabase } from "./supabase";

export type NoticeRow = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "students" | "teachers";
  created_at: string;
};

export async function listNoticesForStudents(): Promise<NoticeRow[]> {
  const { data } = await supabase
    .from("notices")
    .select("*")
    .in("audience", ["all", "students"])
    .order("created_at", { ascending: false });
  return (data as NoticeRow[]) ?? [];
}
