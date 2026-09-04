"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { programs } from "@/data/programs";
import { IconCheck } from "@/components/icons";
import { useToast } from "@/components/Toast";

type StudentType = "kid" | "student" | "women";

const STUDENT_TYPES: { key: StudentType; title: string; desc: string }[] = [
  { key: "kid", title: "طفل", desc: "من 4 إلى 12 سنة" },
  { key: "student", title: "طالب", desc: "من 13 سنة فأكثر" },
  { key: "women", title: "نساء", desc: "برنامج خاص بالنساء" },
];

const TIME_SLOTS = ["4:00 م", "5:30 م", "7:00 م", "8:30 م", "10:00 م"];
const WEEK_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const STEPS = ["نوع الطالب", "بيانات الطالب", "اختيار الوقت", "تأكيد الاشتراك"];

function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProgram = searchParams.get("program") ?? "";
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [studentType, setStudentType] = useState<StudentType | null>(null);
  const [programSlug, setProgramSlug] = useState(preselectedProgram);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const selectedProgram = useMemo(() => programs.find((p) => p.slug === programSlug), [programSlug]);

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function validateStep(): string | null {
    if (step === 0 && !studentType) return "الرجاء اختيار نوع الطالب للمتابعة.";
    if (step === 1) {
      if (!form.name.trim() || !form.phone.trim()) return "الرجاء تعبئة الاسم ورقم الجوال.";
      if (!programSlug) return "الرجاء اختيار البرنامج التعليمي.";
    }
    if (step === 2 && (selectedDays.length === 0 || !selectedTime)) {
      return "الرجاء اختيار يوم ووقت مناسب للحصص.";
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
    showToast("تم تأكيد اشتراكك بنجاح، مرحبًا بك في متقن.", "success");
    setTimeout(() => router.push("/dashboard/student"), 700);
  }

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="mt-2 text-2xl font-extrabold text-ink">التسجيل والاشتراك</h1>
          <p className="text-sm text-ink-soft">اختر البرنامج المناسب ويبدأ رحلتك في تعلمك</p>
        </div>

        {/* Step indicator */}
        <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-4" aria-label="خطوات التسجيل">
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
              <h2 className="text-lg font-extrabold text-ink">اختر نوع الطالب</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {STUDENT_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setStudentType(t.key)}
                    aria-pressed={studentType === t.key}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-colors ${
                      studentType === t.key ? "border-gold bg-gold-light" : "border-line bg-bg hover:border-gold/60"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card">
                      <span className="text-lg font-extrabold text-gold-dark">{t.title[0]}</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-ink">{t.title}</div>
                      <div className="text-xs text-ink-soft">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">بيانات الطالب</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="signup-name" className="text-sm font-bold text-ink">الاسم الكامل</label>
                <input
                  id="signup-name"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="اكتب اسمك الكامل"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-phone" className="text-sm font-bold text-ink">رقم الجوال</label>
                  <input
                    id="signup-phone"
                    dir="ltr"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="05xxxxxxxx"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-email" className="text-sm font-bold text-ink">البريد الإلكتروني</label>
                  <input
                    id="signup-email"
                    dir="ltr"
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="signup-program" className="text-sm font-bold text-ink">البرنامج التعليمي</label>
                <select
                  id="signup-program"
                  className="input"
                  value={programSlug}
                  onChange={(e) => setProgramSlug(e.target.value)}
                >
                  <option value="">اختر البرنامج المناسب</option>
                  {programs.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-extrabold text-ink">اختيار الوقت المناسب</h2>
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-ink">أيام الحصص</legend>
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
                <legend className="mb-3 text-sm font-bold text-ink">الوقت المناسب</legend>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      aria-pressed={selectedTime === t}
                      className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                        selectedTime === t
                          ? "bg-gold-gradient text-white shadow-soft"
                          : "border border-line bg-bg text-ink-soft hover:text-gold-dark"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">تأكيد الاشتراك</h2>
              <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
                <SummaryRow label="نوع الطالب" value={STUDENT_TYPES.find((t) => t.key === studentType)?.title ?? "—"} />
                <SummaryRow label="البرنامج" value={selectedProgram?.title ?? "—"} />
                <SummaryRow label="الاسم" value={form.name || "—"} />
                <SummaryRow label="الجوال" value={form.phone || "—"} />
                <SummaryRow label="أيام الحصص" value={selectedDays.join("، ") || "—"} />
                <SummaryRow label="الوقت" value={selectedTime || "—"} />
                {selectedProgram && <SummaryRow label="السعر الشهري" value={`${selectedProgram.price} ريال`} />}
              </div>
              <p className="text-xs leading-relaxed text-ink-soft">
                بالضغط على "تأكيد الاشتراك" فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بمنصة متقن.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button onClick={back} className="btn-outline">
                السابق
              </button>
            ) : (
              <Link href="/login" className="text-sm font-bold text-ink-soft hover:text-gold-dark">
                لديك حساب مسبقًا؟ سجّل دخول
              </Link>
            )}

            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary">
                التالي ‹
              </button>
            ) : (
              <button onClick={confirm} disabled={submitting} className="btn-primary disabled:opacity-70">
                {submitting ? "جارٍ التأكيد..." : "تأكيد الاشتراك"}
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
