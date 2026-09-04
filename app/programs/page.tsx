"use client";

import { useMemo, useState } from "react";
import { programs } from "@/data/programs";
import ProgramCard from "@/components/ProgramCard";
import { Breadcrumb } from "@/components/ui";

const FILTERS: { key: "all" | "children" | "adults" | "women"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "children", label: "للأطفال" },
  { key: "adults", label: "للكبار" },
  { key: "women", label: "للنساء" },
];

export default function ProgramsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return programs;
    return programs.filter((p) => p.category === filter || p.category === "all");
  }, [filter]);

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "البرامج التعليمية" }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">البرامج التعليمية</h1>
        <p className="max-w-xl text-ink-soft">
          اختر البرنامج المناسب ويبدأ رحلتك في تعلم القرآن الكريم بإشراف نخبة من المعلمين والمعلمات.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-pill px-5 py-2.5 text-sm font-bold transition-colors ${
              filter === f.key
                ? "bg-gold-gradient text-white shadow-soft"
                : "border border-line bg-card text-ink-soft hover:text-gold-dark"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProgramCard key={p.slug} program={p} />
        ))}
      </div>
    </div>
  );
}
