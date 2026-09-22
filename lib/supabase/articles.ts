import { SupabaseClient } from "@supabase/supabase-js";
import { slugifyName } from "./teachers";

export type ArticleCategory = "الحفظ" | "التجويد" | "التربية" | "عام";

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  excerpt: string;
  excerpt_en: string | null;
  content: string;
  content_en: string | null;
  category: ArticleCategory;
  image: string | null;
  status: "published" | "draft";
  views: number;
  created_at: string;
};

export type ArticleInput = {
  title: string;
  title_en: string;
  excerpt: string;
  excerpt_en: string;
  content: string;
  content_en: string;
  category: ArticleCategory;
  image: string;
  status: "published" | "draft";
};

// Paragraphs are separated by a blank line, matching a plain textarea's
// natural line breaks — no need for a repeating array-of-fields form.
export function paragraphsOf(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function readMinutesOf(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateUniqueArticleSlug(supabase: SupabaseClient, title: string): Promise<string> {
  const base = slugifyName(title);
  let candidate = base;
  let suffix = 2;
  while (true) {
    const { data } = await supabase.from("articles").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function listPublishedArticles(supabase: SupabaseClient): Promise<ArticleRow[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return (data as ArticleRow[]) ?? [];
}

export async function getPublishedArticleBySlug(supabase: SupabaseClient, slug: string): Promise<ArticleRow | null> {
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as ArticleRow | null) ?? null;
}

export async function incrementArticleViews(supabase: SupabaseClient, slug: string): Promise<void> {
  await supabase.rpc("increment_article_views", { article_slug: slug });
}

export async function listAllArticlesAdmin(supabase: SupabaseClient): Promise<ArticleRow[]> {
  const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
  return (data as ArticleRow[]) ?? [];
}

export async function createArticle(supabase: SupabaseClient, input: ArticleInput): Promise<boolean> {
  const slug = await generateUniqueArticleSlug(supabase, input.title);
  const { error } = await supabase.from("articles").insert({
    slug,
    title: input.title,
    title_en: input.title_en || null,
    excerpt: input.excerpt,
    excerpt_en: input.excerpt_en || null,
    content: input.content,
    content_en: input.content_en || null,
    category: input.category,
    image: input.image || null,
    status: input.status,
  });
  return !error;
}

export async function updateArticle(supabase: SupabaseClient, id: string, input: ArticleInput): Promise<boolean> {
  const { error } = await supabase
    .from("articles")
    .update({
      title: input.title,
      title_en: input.title_en || null,
      excerpt: input.excerpt,
      excerpt_en: input.excerpt_en || null,
      content: input.content,
      content_en: input.content_en || null,
      category: input.category,
      image: input.image || null,
      status: input.status,
    })
    .eq("id", id);
  return !error;
}

export async function deleteArticle(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await supabase.from("articles").delete().eq("id", id);
  return !error;
}
