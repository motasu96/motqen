import { SupabaseClient } from "@supabase/supabase-js";

export type NoticeAudience = "all" | "students" | "teachers";

export type NoticeRow = {
  id: string;
  title: string;
  body: string;
  audience: NoticeAudience;
  created_at: string;
};

export async function listNoticesForAudience(
  supabase: SupabaseClient,
  audience: "students" | "teachers"
): Promise<NoticeRow[]> {
  const { data } = await supabase
    .from("notices")
    .select("*")
    .in("audience", ["all", audience])
    .order("created_at", { ascending: false });
  return (data as NoticeRow[]) ?? [];
}

export async function listAllNotices(supabase: SupabaseClient): Promise<NoticeRow[]> {
  const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
  return (data as NoticeRow[]) ?? [];
}

export async function createNotice(
  supabase: SupabaseClient,
  params: { title: string; body: string; audience: NoticeAudience }
): Promise<boolean> {
  const { error } = await supabase.from("notices").insert(params);
  return !error;
}

export async function deleteNotice(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase.from("notices").delete().eq("id", id);
  return !error;
}
