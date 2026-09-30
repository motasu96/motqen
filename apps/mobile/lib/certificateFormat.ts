// Arabic-only subset of lib/certificateFormat.ts on the web app (the
// mobile app has no locale switch).

import { Gender } from "./examsCertificates";

export type CertScope = "parts" | "khatm";

export function studentPhrases(gender: Gender) {
  return gender === "female"
    ? { student: "الطالبة", completed: "أتمّت", passed: "واجتازت" }
    : { student: "الطالب", completed: "أتمّ", passed: "واجتاز" };
}

export function teacherLabel(gender: Gender): string {
  return gender === "female" ? "المعلمة" : "المعلم";
}

export function certificateTitle(scope: CertScope): string {
  return scope === "khatm" ? "شهادة ختم القرآن الكريم" : "شهادة حفظ";
}

const AR_JUZ_WORDS: Record<number, string> = { 1: "جزء واحد", 2: "جزءان" };

export function formatJuzCount(n: number): string {
  return AR_JUZ_WORDS[n] ?? `${n} جزءًا`;
}

export function amountShort(scope: CertScope, juzCount: number | null): string {
  if (scope === "khatm") return "القرآن كاملًا";
  return formatJuzCount(juzCount ?? 0);
}

export function hijriDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
      date
    );
  } catch {
    return "";
  }
}

export function gregorianDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("ar-SA-u-nu-latn", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}
