import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { articles, Article } from "@/data/articles";
import { Breadcrumb } from "@/components/ui";
import { localize } from "@/lib/localize";

const CATEGORY_KEYS: Record<Article["category"], "catHifz" | "catTajweed" | "catTarbiya" | "catGeneral"> = {
  الحفظ: "catHifz",
  التجويد: "catTajweed",
  التربية: "catTarbiya",
  عام: "catGeneral",
};

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  const la = localize(article, locale);
  const t = await getTranslations({ locale, namespace: "Site" });
  return {
    title: `${la.title} | ${t("siteName")}`,
    description: la.excerpt,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  return <ArticleDetailContent article={article} />;
}

function ArticleDetailContent({ article }: { article: Article }) {
  const locale = useLocale();
  const t = useTranslations("Articles");
  const tNav = useTranslations("Nav");
  const la = localize(article, locale);

  return (
    <article className="container-page section">
      <Breadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("articles"), href: "/articles" },
          { label: la.title },
        ]}
      />

      <div className="mx-auto mt-8 max-w-3xl">
        <span className="badge">{t(CATEGORY_KEYS[article.category])}</span>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{la.title}</h1>
        <p className="mt-3 text-sm text-ink-soft">{article.date} · {article.readMinutes} {t("readMinutes")}</p>

        <div className="mt-8 flex flex-col gap-5">
          {la.content.map((paragraph, i) => (
            <p key={i} className="leading-loose text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
