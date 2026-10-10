import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";

// parts = memorized N juz', khatm = the whole Quran, course = completed one
// of a program's courses (e.g. the Tajweed program's "تأهيل السند").
export type CertScope = "parts" | "khatm" | "course";
export type Gender = "male" | "female";

// Correct, independent gendering: the student's own wording (اجتاز/اجتازت
// etc.) vs. the teacher's own title (المعلم/المعلمة) — the source design's
// demo script coupled these under one toggle for mockup convenience, but
// a male teacher can teach a female student and vice versa in real data.
export function studentPhrases(gender: Gender, locale: string) {
  if (locale === "en") {
    return { student: "the student", completed: "has completed", passed: "passed" };
  }
  return gender === "female"
    ? { student: "الطالبة", completed: "أتمّت", passed: "واجتازت" }
    : { student: "الطالب", completed: "أتمّ", passed: "واجتاز" };
}

// "May Allah bless him/her and benefit others through him/her" — the closing
// du'a on the certificate, inflected for the student's gender.
export function blessingPhrase(gender: Gender): string {
  return gender === "female" ? "أن يبارك فيها وينفع بها" : "أن يبارك فيه وينفع به";
}

export function teacherLabel(gender: Gender, locale: string): string {
  if (locale === "en") return "Teacher";
  return gender === "female" ? "المعلمة" : "المعلم";
}

export function certificateTitle(scope: CertScope, locale: string) {
  if (locale === "en") {
    if (scope === "course") return "Certificate of Course Completion";
    return scope === "khatm" ? "Certificate of Quran Completion" : "Certificate of Quran Memorization";
  }
  if (scope === "course") return "شهادة إتمام دورة";
  return scope === "khatm" ? "شهادة ختم القرآن الكريم" : "شهادة حفظ";
}

// The course's title as it appears on the site, or "" if it is unknown (an
// old/removed slug) — callers show a dash then.
export function courseTitle(programSlug: string | null, courseSlug: string | null, locale: string): string {
  const program = programs.find((p) => p.slug === programSlug);
  const course = program?.courses?.find((c) => c.slug === courseSlug);
  return course ? localize(course, locale).title : "";
}

// What the certificate was awarded for, in one short phrase: "10 أجزاء",
// "القرآن كاملًا" or the course's name.
export function certificateAmount(
  cert: { scope: CertScope; juz_count: number | null; program_slug: string | null; course_slug?: string | null },
  locale: string
): string {
  if (cert.scope === "course") return courseTitle(cert.program_slug, cert.course_slug ?? null, locale) || "—";
  return amountShort(cert.scope, cert.juz_count, locale);
}

const AR_JUZ_WORDS: Record<number, string> = {
  1: "جزء واحد",
  2: "جزءان",
};

// Arabic juz'-count phrasing: exact wording for 1-2 (dual/singular forms
// that would look wrong as digits), digits + "جزءًا" for 3+ — a normal,
// professional convention in real Arabic certificates.
export function formatJuzCount(n: number, locale: string): string {
  if (locale === "en") return n === 1 ? "1 Juzʾ" : `${n} Ajzāʾ`;
  return AR_JUZ_WORDS[n] ?? `${n} جزءًا`;
}

export function amountPhrase(scope: CertScope, juzCount: number | null, locale: string): string {
  if (scope === "course") return locale === "en" ? "the course" : "الدورة";
  if (scope === "khatm") return locale === "en" ? "the entire Holy Quran" : "القرآن الكريم كاملًا";
  const count = juzCount ?? 0;
  return locale === "en"
    ? `${formatJuzCount(count, locale)} of the Holy Quran`
    : `${formatJuzCount(count, locale)} من القرآن الكريم`;
}

export function amountShort(scope: CertScope, juzCount: number | null, locale: string): string {
  if (scope === "course") return locale === "en" ? "Course" : "دورة";
  if (scope === "khatm") return locale === "en" ? "Complete Quran" : "القرآن كاملًا";
  return formatJuzCount(juzCount ?? 0, locale);
}

export function hijriDate(isoDate: string, locale: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const cal = locale === "en" ? "en-US-u-ca-islamic-umalqura" : "ar-SA-u-ca-islamic-umalqura";
  try {
    return new Intl.DateTimeFormat(cal, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  } catch {
    return "";
  }
}

export function gregorianDate(isoDate: string, locale: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ar-SA-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
