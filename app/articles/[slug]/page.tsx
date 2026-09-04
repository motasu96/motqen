import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "@/data/articles";
import { Breadcrumb } from "@/components/ui";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} | متقن`,
    description: article.excerpt,
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

  return (
    <article className="container-page section">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "المقالات", href: "/articles" },
          { label: article.title },
        ]}
      />

      <div className="mx-auto mt-8 max-w-3xl">
        <span className="badge">{article.category}</span>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{article.title}</h1>
        <p className="mt-3 text-sm text-ink-soft">{article.date} · {article.readMinutes} دقائق قراءة</p>

        <div className="mt-8 flex flex-col gap-5">
          {article.content.map((paragraph, i) => (
            <p key={i} className="leading-loose text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
