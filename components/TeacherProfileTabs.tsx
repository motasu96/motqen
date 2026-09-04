"use client";

import { useState } from "react";
import { Teacher } from "@/data/teachers";
import { Rating } from "@/components/ui";

const TABS = [
  { key: "about", label: "النبذة" },
  { key: "reviews", label: "التقييمات" },
] as const;

export default function TeacherProfileTabs({ teacher }: { teacher: Teacher }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("about");

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="أقسام ملف المعلم" className="flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-3 text-sm font-bold transition-colors ${
              tab === t.key ? "text-gold-dark" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
            {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gold" />}
          </button>
        ))}
      </div>

      <div key={tab} role="tabpanel" className="animate-fade-up">
        {tab === "about" ? (
          <div className="card flex flex-col gap-6 p-7">
            <p className="leading-relaxed text-ink-soft">{teacher.bio}</p>
            <div>
              <h3 className="mb-3 text-sm font-extrabold text-ink">التخصصات</h3>
              <div className="flex flex-wrap gap-2">
                {teacher.specialties.map((s) => (
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
