"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { articles, Article } from "@/data/articles";
import { Breadcrumb } from "@/components/ui";

const CATEGORIES: { key: Article["category"] | "الكل"; label: string }[] = [
  { key: "الكل", label: "الكل" },
  { key: "الحفظ", label: "الحفظ" },
  { key: "التجويد", label: "التجويد" },
  { key: "التربية", label: "التربية" },
  { key: "عام", label: "عام" },
];

export default function ArticlesPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]["key"]>("الكل");

  const filtered = useMemo(
    () => (cat === "الكل" ? articles : articles.filter((a) => a.category === cat)),
    [cat]
  );

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "المقالات" }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">المقالات</h1>
        <p className="max-w-xl text-ink-soft">مقالات تربوية وشرعية منوّعة في تعليم القرآن الكريم وحفظه وتجويده.</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="تصفية المقالات">
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

      <div key={cat} className="animate-fade-up mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Link key={a.slug} href={`/articles/${a.slug}`} className="card-interactive flex flex-col gap-4 p-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
              <Image
                src={a.image}
                alt={a.title}
                fill
                sizes="(min-width: 1024px) 380px, 90vw"
                className="object-cover"
              />
            </div>
            <span className="badge w-fit">{a.category}</span>
            <h2 className="text-lg font-extrabold leading-snug text-ink">{a.title}</h2>
            <p className="text-sm leading-relaxed text-ink-soft">{a.excerpt}</p>
            <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
              <span className="text-xs text-ink-soft">{a.date} · {a.readMinutes} دقائق قراءة</span>
              <span className="text-sm font-bold text-gold-dark">قراءة المزيد ‹</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
