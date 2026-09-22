import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { ArticleCategory, ArticleRow, getPublishedArticleBySlug, incrementArticleViews, paragraphsOf, readMinutesOf } from "@/lib/supabase/articles";
import { Breadcrumb } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

// Article data is DB-backed and can change (new posts, edits), so this
// route renders per-request instead of being baked into the static build.
export const dynamic = "force-dynamic";

const CATEGORY_KEYS: Record<ArticleCategory, "catHifz" | "catTajweed" | "catTarbiya" | "catGeneral"> = {
  الحفظ: "catHifz",
  التجويد: "catTajweed",
  التربية: "catTarbiya",
  عام: "catGeneral",
};

async function loadArticle(slug: string): Promise<ArticleRow | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = await createClient();
    const article = await getPublishedArticleBySlug(supabase, slug);
    if (article) incrementArticleViews(supabase, slug).catch(() => {});
    return article;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = await loadArticle(slug);
  if (!article) return {};
  const title = locale === "en" && article.title_en ? article.title_en : article.title;
  const excerpt = locale === "en" && article.excerpt_en ? article.excerpt_en : article.excerpt;
  const t = await getTranslations({ locale, namespace: "Site" });
  return {
    title: `${title} | ${t("siteName")}`,
    description: excerpt,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) notFound();

  return <ArticleDetailContent article={article} />;
}

function ArticleDetailContent({ article }: { article: ArticleRow }) {
  const locale = useLocale();
  const t = useTranslations("Articles");
  const tNav = useTranslations("Nav");

  const title = locale === "en" && article.title_en ? article.title_en : article.title;
  const content = locale === "en" && article.content_en ? article.content_en : article.content;
  const paragraphs = paragraphsOf(content);

  return (
    <article className="container-page section">
      <Breadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("articles"), href: "/articles" },
          { label: title },
        ]}
      />

      <div className="mx-auto mt-8 max-w-3xl">
        <span className="badge">{t(CATEGORY_KEYS[article.category])}</span>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {article.created_at.slice(0, 10)} · {readMinutesOf(content)} {t("readMinutes")}
        </p>

        <div className="mt-8 flex flex-col gap-5">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="leading-loose text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
