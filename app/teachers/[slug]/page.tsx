"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeacherBySlug } from "@/data/teachers";
import { Breadcrumb, Rating } from "@/components/ui";

const TABS = [
  { key: "about", label: "النبذة" },
  { key: "reviews", label: "التقييمات" },
] as const;

export default function TeacherProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const teacher = getTeacherBySlug(slug);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("about");

  if (!teacher) notFound();

  return (
    <div className="container-page section">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "المعلمون", href: "/teachers" },
          { label: teacher.name },
        ]}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="card flex h-fit flex-col items-center gap-5 p-7 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gold-light text-4xl font-extrabold text-gold-dark">
            {teacher.avatarInitial}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink">{teacher.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">{teacher.title}</p>
          </div>
          <Rating value={teacher.stats.rating} />
          <Link href={`/signup?teacher=${teacher.slug}`} className="btn-primary w-full">
            احجز حصة معه
          </Link>

          <div className="grid w-full grid-cols-2 gap-4 border-t border-line pt-5 text-center">
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.students}</div>
              <div className="text-xs text-ink-soft">طالب</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.yearsExperience}</div>
              <div className="text-xs text-ink-soft">سنوات خبرة</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.completedSessions}</div>
              <div className="text-xs text-ink-soft">حصة مكتملة</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">{teacher.stats.rating}</div>
              <div className="text-xs text-ink-soft">تقييم الطلاب</div>
            </div>
          </div>
        </aside>

        <div className="flex flex-col gap-6">
          <div className="flex gap-2 border-b border-line">
            {TABS.map((t) => (
              <button
                key={t.key}
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
    </div>
  );
}
