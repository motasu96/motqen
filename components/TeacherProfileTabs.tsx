"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Teacher } from "@/data/teachers";
import { Rating } from "@/components/ui";
import { localize } from "@/lib/localize";

export default function TeacherProfileTabs({ teacher }: { teacher: Teacher }) {
  const [tab, setTab] = useState<"about" | "reviews">("about");
  const locale = useLocale();
  const t = useTranslations("Teachers");
  const tt = localize(teacher, locale);

  const TABS = [
    { key: "about" as const, label: t("tabAbout") },
    { key: "reviews" as const, label: t("tabReviews") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label={t("tabsAriaLabel")} className="flex gap-2 border-b border-line">
        {TABS.map((tItem) => (
          <button
            key={tItem.key}
            role="tab"
            aria-selected={tab === tItem.key}
            onClick={() => setTab(tItem.key)}
            className={`relative px-4 py-3 text-sm font-bold transition-colors ${
              tab === tItem.key ? "text-gold-dark" : "text-ink-soft hover:text-ink"
            }`}
          >
            {tItem.label}
            {tab === tItem.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gold" />}
          </button>
        ))}
      </div>

      <div key={tab} role="tabpanel" className="animate-fade-up">
        {tab === "about" ? (
          <div className="card flex flex-col gap-6 p-7">
            <p className="leading-relaxed text-ink-soft">{tt.bio}</p>
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-ink">{t("specialtiesTitle")}</h3>
              <div className="flex flex-wrap gap-2">
                {tt.specialties.map((s) => (
                  <span key={s} className="badge">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {teacher.reviews.map((r, i) => (
              <div key={i} className="card flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{r.name}</span>
                  <span className="text-xs text-ink-soft">{r.date}</span>
                </div>
                <Rating value={r.rating} />
                <p className="text-sm leading-relaxed text-ink-soft">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
