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

type StudentType = "kid" | "student" | "women";

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
  const STEPS = [t("step1"), t("step2"), t("step3"), t("step4")];

  const [step, setStep] = useState(0);
  const [studentType, setStudentType] = useState<StudentType | null>(null);
  const [programSlug, setProgramSlug] = useState(preselectedProgram);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const selectedProgram = useMemo(() => {
    const p = programs.find((p) => p.slug === programSlug);
    return p ? localize(p, locale) : undefined;
  }, [programSlug, locale]);

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function validateStep(): string | null {
    if (step === 0 && !studentType) return t("errorStudentType");
    if (step === 1) {
      if (!form.name.trim() || !form.phone.trim()) return t("errorNamePhone");
      if (!programSlug) return t("errorProgram");
    }
    if (step === 2 && (selectedDays.length === 0 || !selectedTime)) {
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
    if (step < STEPS.length - 1) setStep((s) => s + 1);
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
    } catch {}
    showToast(t("toastSuccess"), "success");
    setTimeout(() => router.push("/dashboard/student"), 700);
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
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2 sm:gap-4">
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
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-6 sm:w-12 ${i < step ? "bg-gold" : "bg-line"}`} />}
            </li>
          ))}
        </ol>

        <div key={step} className="card animate-fade-up p-7 sm:p-9">
          {step === 0 && (
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

          {step === 1 && (
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

          {step === 2 && (
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

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">{t("confirmSubscription")}</h2>
              <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
                <SummaryRow label={t("summaryType")} value={STUDENT_TYPES.find((tp) => tp.key === studentType)?.title ?? t("dash")} />
                <SummaryRow label={t("summaryProgram")} value={selectedProgram?.title ?? t("dash")} />
                <SummaryRow label={t("summaryName")} value={form.name || t("dash")} />
                <SummaryRow label={t("summaryPhone")} value={form.phone || t("dash")} />
                <SummaryRow label={t("summaryDays")} value={selectedDays.join("، ") || t("dash")} />
                <SummaryRow label={t("summaryTime")} value={selectedTime || t("dash")} />
                {selectedProgram && <SummaryRow label={t("summaryPrice")} value={`${selectedProgram.price} ${t("rial")}`} />}
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

            {step < STEPS.length - 1 ? (
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
