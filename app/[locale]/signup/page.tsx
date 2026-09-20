"use client";

import { Suspense, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { programs } from "@/data/programs";
import { IconCheck } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { localize } from "@/lib/localize";
import { buildPlan, PLAN_DURATIONS, SurahPosition, PlanDirection } from "@/lib/quranPlan";
import { getSurahByNumber } from "@/data/quranSurahs";

type StudentType = "kid" | "student" | "women";
type StepKind = "type" | "info" | "plan" | "time" | "confirm";
const HIFZ_PROGRAM_SLUG = "hifz-mutqan";

function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProgram = searchParams.get("program") ?? "";
  const { showToast } = useToast();
  const t = useTranslations("Signup");
  const locale = useLocale();

  const STUDENT_TYPES: { key: StudentType; title: string; desc: string }[] = [
    { key: "kid", title: t("typeKidTitle"), desc: t("typeKidDesc") },
    { key: "student", title: t("typeStudentTitle"), desc: t("typeStudentDesc") },
    { key: "women", title: t("typeWomenTitle"), desc: t("typeWomenDesc") },
  ];

  const TIME_SLOTS = t.raw("timeSlots") as string[];
  const WEEK_DAYS = t.raw("weekDays") as string[];

  const [step, setStep] = useState(0);
  const [studentType, setStudentType] = useState<StudentType | null>(null);
  const [programSlug, setProgramSlug] = useState(preselectedProgram);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [planDurationMonths, setPlanDurationMonths] = useState<number | null>(null);
  const [alreadyMemorizedSurahs, setAlreadyMemorizedSurahs] = useState(0);
  const [reviewDaysPerWeek, setReviewDaysPerWeek] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<PlanDirection>("fromEnd");

  const isHifzProgram = programSlug === HIFZ_PROGRAM_SLUG;

  const steps = useMemo<StepKind[]>(() => {
    const arr: StepKind[] = ["type", "info"];
    if (isHifzProgram) arr.push("plan");
    arr.push("time", "confirm");
    return arr;
  }, [isHifzProgram]);

  const STEP_LABELS: Record<StepKind, string> = {
    type: t("step1"),
    info: t("step2"),
    plan: t("step2b"),
    time: t("step3"),
    confirm: t("step4"),
  };
  const stepKind = steps[Math.min(step, steps.length - 1)];

  const selectedProgram = useMemo(() => {
    const p = programs.find((p) => p.slug === programSlug);
    return p ? localize(p, locale) : undefined;
  }, [programSlug, locale]);

  const DURATION_LABELS: Record<number, string> = {
    6: t("planMonths6"),
    12: t("planYear1"),
    24: t("planYears2"),
    36: t("planYears3"),
  };

  const planPreviews = useMemo(
    () =>
      PLAN_DURATIONS.map((d) => {
        const result = buildPlan({ durationMonths: d.months, alreadyMemorizedSurahs, reviewDaysPerWeek, direction });
        return { months: d.months, ayahsPerWeek: result.ayahsPerWeek, result };
      }),
    [alreadyMemorizedSurahs, reviewDaysPerWeek, direction]
  );
  const selectedPlanPreview = planPreviews.find((p) => p.months === planDurationMonths);

  function formatPosition(pos: SurahPosition) {
    const surah = getSurahByNumber(pos.surahNumber);
    const surahName = surah ? (locale === "en" ? surah.nameEn : surah.nameAr) : "";
    return `${surahName} — ${t("planAyahLabel", { n: pos.ayahInSurah })}`;
  }

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function validateStep(): string | null {
    if (stepKind === "type" && !studentType) return t("errorStudentType");
    if (stepKind === "info") {
      if (!form.name.trim() || !form.phone.trim()) return t("errorNamePhone");
      if (!programSlug) return t("errorProgram");
    }
    if (stepKind === "plan" && !planDurationMonths) return t("errorPlan");
    if (stepKind === "time" && (selectedDays.length === 0 || !selectedTime)) {
      return t("errorTime");
    }
    return null;
  }

  function next() {
    const error = validateStep();
    if (error) {
      showToast(error, "error");
      return;
    }
    if (step < steps.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function confirm() {
    setSubmitting(true);
    try {
      localStorage.setItem(
        "motqen_booking",
        JSON.stringify({ studentType, programSlug, form, selectedDays, selectedTime, confirmedAt: new Date().toISOString() })
      );
      if (isHifzProgram && planDurationMonths) {
        localStorage.setItem(
          "motqen_memorization_plan",
          JSON.stringify({
            durationMonths: planDurationMonths,
            alreadyMemorizedSurahs,
            reviewDaysPerWeek,
            direction,
            startedAt: new Date().toISOString(),
          })
        );
      }
    } catch {}
    if (form.email) {
      fetch("/api/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, locale }),
      }).catch(() => {});
    }
    showToast(t("toastSuccess"), "success");
    setTimeout(() => router.push("/onboarding"), 700);
  }

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="mt-2 text-2xl font-extrabold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-soft">{t("subtitle")}</p>
        </div>

        {/* Step indicator */}
        <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-4" aria-label={t("stepsLabel")}>
          {steps.map((kind, i) => (
            <li key={kind} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  aria-current={i === step ? "step" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    i < step
                      ? "bg-gold-gradient text-white"
                      : i === step
                      ? "bg-gold-gradient text-white shadow-soft"
                      : "border border-line bg-card text-ink-soft"
                  }`}
                >
                  {i < step ? <IconCheck className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </div>
                <span className={`hidden text-xs font-bold sm:block ${i <= step ? "text-ink" : "text-ink-soft"}`}>
                  {STEP_LABELS[kind]}
                </span>
              </div>
              {i < steps.length - 1 && <div className={`h-0.5 w-6 sm:w-12 ${i < step ? "bg-gold" : "bg-line"}`} />}
            </li>
          ))}
        </ol>

        <div key={step} className="card animate-fade-up p-7 sm:p-9">
          {stepKind === "type" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">{t("chooseType")}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {STUDENT_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setStudentType(type.key)}
                    aria-pressed={studentType === type.key}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-colors ${
                      studentType === type.key ? "border-gold bg-gold-light" : "border-line bg-bg hover:border-gold/60"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card">
                      <span className="text-lg font-extrabold text-gold-dark">{type.title[0]}</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-ink">{type.title}</div>
                      <div className="text-xs text-ink-soft">{type.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {stepKind === "info" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">{t("studentInfo")}</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="signup-name" className="text-sm font-bold text-ink">{t("nameLabel")}</label>
                <input
                  id="signup-name"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t("namePlaceholder")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-phone" className="text-sm font-bold text-ink">{t("phoneLabel")}</label>
                  <input
                    id="signup-phone"
                    dir="ltr"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder={t("phonePlaceholder")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-email" className="text-sm font-bold text-ink">{t("emailLabel")}</label>
                  <input
                    id="signup-email"
                    dir="ltr"
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="signup-program" className="text-sm font-bold text-ink">{t("programLabel")}</label>
                <select
                  id="signup-program"
                  className="input"
                  value={programSlug}
                  onChange={(e) => setProgramSlug(e.target.value)}
                >
                  <option value="">{t("programPlaceholder")}</option>
                  {programs.map((p) => {
                    const lp = localize(p, locale);
                    return (
                      <option key={p.slug} value={p.slug}>
                        {lp.title}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          {stepKind === "plan" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-extrabold text-ink">{t("planTitle")}</h2>
                <p className="mt-1 text-sm text-ink-soft">{t("planSubtitle")}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {planPreviews.map((p) => (
                  <button
                    key={p.months}
                    type="button"
                    onClick={() => setPlanDurationMonths(p.months)}
                    aria-pressed={planDurationMonths === p.months}
                    className={`flex flex-col items-start gap-2 rounded-2xl border p-5 text-start transition-colors ${
                      planDurationMonths === p.months ? "border-gold bg-gold-light" : "border-line bg-bg hover:border-gold/60"
                    }`}
                  >
                    <span className="text-base font-extrabold text-ink">{DURATION_LABELS[p.months]}</span>
                    <span className="text-sm text-ink-soft">{t("planPaceFormat", { ayahs: Math.round(p.ayahsPerWeek) })}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="plan-already" className="text-sm font-bold text-ink">
                    {t("planAlreadyMemorizedLabel")}
                  </label>
                  <input
                    id="plan-already"
                    type="number"
                    min={0}
                    max={113}
                    dir="ltr"
                    className="input"
                    value={alreadyMemorizedSurahs}
                    onChange={(e) => setAlreadyMemorizedSurahs(Math.max(0, Math.min(113, Number(e.target.value) || 0)))}
                  />
                  <span className="text-xs text-ink-soft">{t("planAlreadyMemorizedHint")}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-ink">{t("planReviewDaysLabel")}</span>
                  <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1">
                    {([1, 2] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setReviewDaysPerWeek(d)}
                        aria-pressed={reviewDaysPerWeek === d}
                        className={`rounded-pill py-2 text-sm font-bold transition-colors ${
                          reviewDaysPerWeek === d ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
                        }`}
                      >
                        {d === 1 ? t("planReviewDays1") : t("planReviewDays2")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">{t("planDirectionLabel")}</span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      { key: "fromEnd" as const, label: t("planDirectionFromEnd") },
                      { key: "fromStart" as const, label: t("planDirectionFromStart") },
                    ]
                  ).map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDirection(d.key)}
                      aria-pressed={direction === d.key}
                      className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-colors ${
                        direction === d.key ? "border-gold bg-gold-light text-ink" : "border-line text-ink-soft hover:border-gold/60"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedPlanPreview && (
                <div className="rounded-2xl border border-line bg-bg p-5">
                  <h3 className="mb-3 text-sm font-extrabold text-ink">{t("planSummaryTitle")}</h3>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-soft">{t("planSummaryWeeks")}</span>
                      <span className="font-bold text-ink">{selectedPlanPreview.result.totalWeeks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-soft">{t("planSummaryPace")}</span>
                      <span className="font-bold text-ink">
                        {t("planPaceFormat", { ayahs: Math.round(selectedPlanPreview.ayahsPerWeek) })}
                      </span>
                    </div>
                    {selectedPlanPreview.result.weeks[0] && (
                      <div className="flex items-center justify-between">
                        <span className="text-ink-soft">{t("planSummaryFirstWeek")}</span>
                        <span className="font-bold text-ink">
                          {formatPosition(selectedPlanPreview.result.weeks[0].fromPosition)} {t("planRangeSeparator")}{" "}
                          {formatPosition(selectedPlanPreview.result.weeks[0].toPosition)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {stepKind === "time" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-extrabold text-ink">{t("chooseTime")}</h2>
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-ink">{t("sessionDays")}</legend>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      aria-pressed={selectedDays.includes(day)}
                      className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                        selectedDays.includes(day)
                          ? "bg-gold-gradient text-white shadow-soft"
                          : "border border-line bg-bg text-ink-soft hover:text-gold-dark"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-ink">{t("suitableTime")}</legend>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      aria-pressed={selectedTime === slot}
                      className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                        selectedTime === slot
                          ? "bg-gold-gradient text-white shadow-soft"
                          : "border border-line bg-bg text-ink-soft hover:text-gold-dark"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {stepKind === "confirm" && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">{t("confirmSubscription")}</h2>
              <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
                <SummaryRow label={t("summaryType")} value={STUDENT_TYPES.find((tp) => tp.key === studentType)?.title ?? t("dash")} />
                <SummaryRow label={t("summaryProgram")} value={selectedProgram?.title ?? t("dash")} />
                {isHifzProgram && planDurationMonths && (
                  <SummaryRow label={t("summaryPlan")} value={DURATION_LABELS[planDurationMonths]} />
                )}
                <SummaryRow label={t("summaryName")} value={form.name || t("dash")} />
                <SummaryRow label={t("summaryPhone")} value={form.phone || t("dash")} />
                <SummaryRow label={t("summaryDays")} value={selectedDays.join("، ") || t("dash")} />
                <SummaryRow label={t("summaryTime")} value={selectedTime || t("dash")} />
              </div>
              <p className="text-xs leading-relaxed text-ink-soft">{t("termsNotice")}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button onClick={back} className="btn-outline">
                {t("back")}
              </button>
            ) : (
              <Link href="/login" className="text-sm font-bold text-ink-soft hover:text-gold-dark">
                {t("haveAccount")}
              </Link>
            )}

            {step < steps.length - 1 ? (
              <button onClick={next} className="btn-primary">
                {t("next")} ‹
              </button>
            ) : (
              <button onClick={confirm} disabled={submitting} className="btn-primary disabled:opacity-70">
                {submitting ? t("confirming") : t("confirm")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupFlow />
    </Suspense>
  );
}
