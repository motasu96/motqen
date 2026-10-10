// Arabic-only subset of lib/certificateFormat.ts on the web app (the
// mobile app has no locale switch).

import { Gender } from "./examsCertificates";
import { programs } from "./programs";

// parts = memorized N juz', khatm = the whole Quran, course = completed one
// of a program's courses (e.g. the Tajweed program's "تأهيل السند").
export type CertScope = "parts" | "khatm" | "course";

export function studentPhrases(gender: Gender) {
  return gender === "female"
    ? { student: "الطالبة", completed: "أتمّت", passed: "واجتازت" }
    : { student: "الطالب", completed: "أتمّ", passed: "واجتاز" };
}

export function teacherLabel(gender: Gender): string {
  return gender === "female" ? "المعلمة" : "المعلم";
}

export function certificateTitle(scope: CertScope): string {
  if (scope === "course") return "شهادة إتمام دورة";
  return scope === "khatm" ? "شهادة ختم القرآن الكريم" : "شهادة حفظ";
}

// "May Allah bless him/her and benefit others through him/her", inflected for
// the student's gender (the closing du'a on the certificate).
export function blessingPhrase(gender: Gender): string {
  return gender === "female" ? "أن يبارك فيها وينفع بها" : "أن يبارك فيه وينفع به";
}

// The course's title as it appears on the site, or "" for an unknown slug.
export function courseTitle(programSlug: string | null, courseSlug: string | null): string {
  const course = programs.find((p) => p.slug === programSlug)?.courses?.find((c) => c.slug === courseSlug);
  return course?.title ?? "";
}

// What the certificate was awarded for, in one short phrase.
export function certificateAmount(cert: {
  scope: CertScope;
  juz_count: number | null;
  program_slug: string | null;
  course_slug?: string | null;
}): string {
  if (cert.scope === "course") return courseTitle(cert.program_slug, cert.course_slug ?? null) || "—";
  return amountShort(cert.scope, cert.juz_count);
}

const AR_JUZ_WORDS: Record<number, string> = { 1: "جزء واحد", 2: "جزءان" };

export function formatJuzCount(n: number): string {
  return AR_JUZ_WORDS[n] ?? `${n} جزءًا`;
}

export function amountShort(scope: CertScope, juzCount: number | null): string {
  if (scope === "course") return "دورة";
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
