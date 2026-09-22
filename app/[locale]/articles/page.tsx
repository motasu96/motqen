import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArticleRow, listPublishedArticles } from "@/lib/supabase/articles";
import { createClient } from "@/lib/supabase/server";
import ArticlesPageContent from "@/components/ArticlesPageContent";

// Article data is DB-backed and can change (new posts, edits), so this
// route renders per-request instead of being baked into the static build.
export const dynamic = "force-dynamic";

async function loadArticles(): Promise<ArticleRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = await createClient();
    return await listPublishedArticles(supabase);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Articles" });
  return { title: t("title") };
}

export default async function ArticlesPage() {
  const articles = await loadArticles();
  return <ArticlesPageContent articles={articles} />;
}
