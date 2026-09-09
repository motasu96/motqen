"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { programs } from "@/data/programs";
import ProgramCard from "@/components/ProgramCard";
import { Breadcrumb } from "@/components/ui";

type FilterKey = "all" | "children" | "adults" | "women";

export default function ProgramsPage() {
  const t = useTranslations("Programs");
  const tNav = useTranslations("Nav");
  const [filter, setFilter] = useState<FilterKey>("all");

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "children", label: t("filterChildren") },
    { key: "adults", label: t("filterAdults") },
    { key: "women", label: t("filterWomen") },
  ];

  const filtered = useMemo(() => {
    if (filter === "all") return programs;
    return programs.filter((p) => p.category === filter || p.category === "all");
  }, [filter]);

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("title") }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="max-w-xl text-ink-soft">{t("description")}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={t("title")}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
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

      <div key={filter} className="animate-fade-up mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProgramCard key={p.slug} program={p} />
        ))}
      </div>
    </div>
  );
}
