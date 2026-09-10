"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { articles, Article } from "@/data/articles";
import { Breadcrumb } from "@/components/ui";
import { localize } from "@/lib/localize";
import EmptyState from "@/components/EmptyState";
import { IconInbox } from "@/components/icons";

const CATEGORY_KEYS: Record<Article["category"], "catHifz" | "catTajweed" | "catTarbiya" | "catGeneral"> = {
  الحفظ: "catHifz",
  التجويد: "catTajweed",
  التربية: "catTarbiya",
  عام: "catGeneral",
};

export default function ArticlesPage() {
  const t = useTranslations("Articles");
  const tNav = useTranslations("Nav");
  const tEmpty = useTranslations("EmptyState");
  const locale = useLocale();
  const [cat, setCat] = useState<Article["category"] | "الكل">("الكل");

  const CATEGORIES: { key: Article["category"] | "الكل"; label: string }[] = [
    { key: "الكل", label: t("catAll") },
    { key: "الحفظ", label: t("catHifz") },
    { key: "التجويد", label: t("catTajweed") },
    { key: "التربية", label: t("catTarbiya") },
    { key: "عام", label: t("catGeneral") },
  ];

  const filtered = useMemo(
    () => (cat === "الكل" ? articles : articles.filter((a) => a.category === cat)),
    [cat]
  );

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("title") }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="max-w-xl text-ink-soft">{t("description")}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={t("title")}>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            aria-pressed={cat === c.key}
            className={`rounded-pill px-5 py-2.5 text-sm font-bold transition-colors ${
              cat === c.key ? "bg-gold-gradient text-white shadow-soft" : "border border-line bg-card text-ink-soft hover:text-gold-dark"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={IconInbox}
            title={tEmpty("noArticlesTitle")}
            description={tEmpty("noArticlesDesc")}
            action={
              <button onClick={() => setCat("الكل")} className="btn-outline">
                {tEmpty("showAll")}
              </button>
            }
          />
        </div>
      ) : (
        <div key={cat} className="animate-fade-up mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const la = localize(a, locale);
            return (
              <Link key={a.slug} href={`/articles/${a.slug}`} className="card-interactive flex flex-col gap-4 p-6">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src={a.image}
                    alt={la.title}
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-cover"
                  />
                </div>
                <span className="badge w-fit">{t(CATEGORY_KEYS[a.category])}</span>
                <h2 className="text-lg font-extrabold leading-snug text-ink">{la.title}</h2>
                <p className="text-sm leading-relaxed text-ink-soft">{la.excerpt}</p>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                  <span className="text-xs text-ink-soft">{a.date} · {a.readMinutes} {t("readMinutes")}</span>
                  <span className="text-sm font-bold text-gold-dark">{t("readMore")} ‹</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
