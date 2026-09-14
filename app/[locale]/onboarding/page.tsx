"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";

type Level = "beginner" | "foundation" | "intermediate" | "advanced";
type Goal = "newMemorization" | "review" | "tajweed" | "kids" | "ijazah";
type TeacherPref = "female" | "male" | "none";

export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("Onboarding");

  const LEVELS: { key: Level; title: string; desc: string }[] = [
    { key: "beginner", title: t("levelBeginnerTitle"), desc: t("levelBeginnerDesc") },
    { key: "foundation", title: t("levelFoundationTitle"), desc: t("levelFoundationDesc") },
    { key: "intermediate", title: t("levelIntermediateTitle"), desc: t("levelIntermediateDesc") },
    { key: "advanced", title: t("levelAdvancedTitle"), desc: t("levelAdvancedDesc") },
  ];

  const GOALS: { key: Goal; label: string }[] = [
    { key: "newMemorization", label: t("goalNewMemorization") },
    { key: "review", label: t("goalReview") },
    { key: "tajweed", label: t("goalTajweed") },
    { key: "kids", label: t("goalKids") },
    { key: "ijazah", label: t("goalIjazah") },
  ];

  const TEACHER_PREFS: { key: TeacherPref; label: string }[] = [
    { key: "female", label: t("teacherPrefFemale") },
    { key: "male", label: t("teacherPrefMale") },
    { key: "none", label: t("teacherPrefNone") },
  ];

  const [level, setLevel] = useState<Level | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [teacherPref, setTeacherPref] = useState<TeacherPref>("none");
  const [submitting, setSubmitting] = useState(false);

  function toggleGoal(g: Goal) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function handleSubmit() {
    if (!level) {
      showToast(t("errorLevel"), "error");
      return;
    }
    setSubmitting(true);
    try {
      localStorage.setItem("motqen_onboarding", JSON.stringify({ level, goals, teacherPref, completedAt: new Date().toISOString() }));
    } catch {}
    showToast(t("toastSuccess"), "success");
    setTimeout(() => router.push("/dashboard/student"), 600);
  }

  function handleSkip() {
    router.push("/dashboard/student");
  }

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Logo />
          <span className="eyebrow mt-2">{t("eyebrow")}</span>
          <h1 className="text-2xl font-extrabold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-soft">{t("description")}</p>
        </div>

        <div className="card flex flex-col gap-8 p-7 sm:p-9">
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-ink">{t("levelLabel")}</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setLevel(l.key)}
                  aria-pressed={level === l.key}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-start transition-colors ${
                    level === l.key ? "border-gold bg-gold-light" : "border-line bg-bg hover:border-gold/60"
                  }`}
                >
                  <span className="font-extrabold text-ink">{l.title}</span>
                  <span className="text-xs text-ink-soft">{l.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-bold text-ink">{t("goalsLabel")}</legend>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggleGoal(g.key)}
                  aria-pressed={goals.includes(g.key)}
                  className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                    goals.includes(g.key)
                      ? "bg-gold-gradient text-white shadow-soft"
                      : "border border-line bg-bg text-ink-soft hover:text-gold-dark"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-bold text-ink">{t("teacherPrefLabel")}</legend>
            <div className="grid grid-cols-3 gap-2 rounded-pill border border-line bg-bg p-1" role="group" aria-label={t("teacherPrefLabel")}>
              {TEACHER_PREFS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setTeacherPref(p.key)}
                  aria-pressed={teacherPref === p.key}
                  className={`rounded-pill py-2.5 text-sm font-bold transition-colors ${
                    teacherPref === p.key ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-4">
            <button onClick={handleSkip} className="text-sm font-bold text-ink-soft hover:text-gold-dark">
              {t("skip")}
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary disabled:opacity-70">
              {submitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
