"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Teacher } from "@/data/teachers";
import { Rating } from "@/components/ui";
import { IconStar } from "@/components/icons";
import { localize } from "@/lib/localize";
import { createClient } from "@/lib/supabase/client";
import { getTeacherBookingInfo } from "@/lib/supabase/teachers";
import { canStudentReview, getMyReview, listTeacherReviews, submitReview, TeacherReview } from "@/lib/supabase/reviews";
import { useToast } from "@/components/Toast";

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const t = useTranslations("Teachers");
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={t("reviewStarAria", { count: n })}
            className="p-0.5"
          >
            <IconStar className={`h-6 w-6 transition-colors ${n <= value ? "text-gold" : "text-line"}`} />
          </button>
        );
      })}
    </div>
  );
}

export default function TeacherProfileTabs({ teacher }: { teacher: Teacher }) {
  const [tab, setTab] = useState<"about" | "reviews">("about");
  const locale = useLocale();
  const t = useTranslations("Teachers");
  const tt = localize(teacher, locale);
  const { showToast } = useToast();

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [reviewsReady, setReviewsReady] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasMyReview, setHasMyReview] = useState(false);

  const TABS = [
    { key: "about" as const, label: t("tabAbout") },
    { key: "reviews" as const, label: t("tabReviews") },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReviewsReady(true);
        return;
      }
      const supabase = createClient();
      const info = await getTeacherBookingInfo(supabase, teacher.slug);
      if (cancelled || !info) {
        setReviewsReady(true);
        return;
      }
      setTeacherId(info.id);
      const rows = await listTeacherReviews(supabase, info.id);
      if (cancelled) return;
      setReviews(rows);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) {
        setReviewsReady(true);
        return;
      }
      setStudentId(user.id);
      const [eligible, mine] = await Promise.all([
        canStudentReview(supabase, info.id, user.id),
        getMyReview(supabase, info.id, user.id),
      ]);
      if (cancelled) return;
      setCanReview(eligible);
      if (mine) {
        setHasMyReview(true);
        setFormRating(mine.rating);
        setFormComment(mine.comment);
      }
      setReviewsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [teacher.slug]);

  async function handleSubmitReview() {
    if (!teacherId || !studentId || formRating < 1) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", studentId).single();
    const ok = await submitReview(supabase, {
      teacherId,
      studentId,
      studentName: (profile?.full_name as string | null) ?? t("reviewAnonymousName"),
      rating: formRating,
      comment: formComment.trim(),
    });
    setSubmitting(false);
    if (!ok) {
      showToast(t("toastReviewError"), "error");
      return;
    }
    showToast(t("toastReviewSubmitted"), "success");
    setHasMyReview(true);
    const rows = await listTeacherReviews(supabase, teacherId);
    setReviews(rows);
  }

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
            {canReview && (
              <div className="card flex flex-col gap-4 p-6">
                <h3 className="text-sm font-extrabold text-ink">
                  {hasMyReview ? t("updateReviewTitle") : t("reviewFormTitle")}
                </h3>
                <StarPicker value={formRating} onChange={setFormRating} />
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder={t("reviewCommentPlaceholder")}
                  rows={3}
                  className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-gold"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || formRating < 1}
                  className="btn-primary self-start disabled:opacity-70"
                >
                  {submitting ? t("submittingReview") : hasMyReview ? t("updateReviewCta") : t("submitReviewCta")}
                </button>
              </div>
            )}

            {!reviewsReady ? null : reviews.length === 0 ? (
              <div className="card flex flex-col items-center gap-2 p-8 text-center">
                <h3 className="text-sm font-extrabold text-ink">{t("noReviewsTitle")}</h3>
                <p className="text-sm text-ink-soft">{t("noReviewsDesc")}</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="card flex flex-col gap-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{r.studentName}</span>
                    <span className="text-xs text-ink-soft">{r.createdAt.slice(0, 10)}</span>
                  </div>
                  <Rating value={r.rating} />
                  {r.comment && <p className="text-sm leading-relaxed text-ink-soft">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
