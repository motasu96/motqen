// Memorization plan calculator.
//
// Schedules are built in units of ayahs, grouped by surah, for display
// (safe: ayah counts per surah are fixed regardless of Mushaf print
// edition). The "already memorized" input is still asked in juz' (the unit
// students actually think in), and converted using real juz' boundary data
// below rather than a proportional estimate — juz' are NOT equal-sized in
// ayah count (Juz' 30 alone has 564 ayahs vs. an average of ~208), so an
// even split across 30 would silently misplace the starting point.

import { QURAN_SURAHS, TOTAL_AYAHS } from "@/data/quranSurahs";

const WEEKS_PER_MONTH = 4.345; // 365.25 / 12 / 7

export type PlanDirection = "fromStart" | "fromEnd";

export type PlanDurationKey = "months6" | "year1" | "years2" | "years3";

export const PLAN_DURATIONS: { key: PlanDurationKey; months: number }[] = [
  { key: "months6", months: 6 },
  { key: "year1", months: 12 },
  { key: "years2", months: 24 },
  { key: "years3", months: 36 },
];

export type PlanInput = {
  durationMonths: number;
  alreadyMemorizedJuz: number; // 0..29
  reviewDaysPerWeek: 1 | 2;
  direction: PlanDirection;
};

export type SurahPosition = {
  surahNumber: number; // 1..114, actual Quran numbering
  ayahInSurah: number; // 1..surah's ayah count
};

export type WeekPlanItem = {
  weekIndex: number; // 1-based
  fromAyahIndex: number; // 0-based index into the memorization-order sequence (within the remaining ayahs)
  toAyahIndex: number; // exclusive
  fromPosition: SurahPosition;
  toPosition: SurahPosition; // inclusive end position
};

export type PlanResult = {
  totalWeeks: number;
  remainingAyahs: number;
  ayahsPerWeek: number;
  memorizationDaysPerWeek: number;
  ayahsPerDay: number;
  weeks: WeekPlanItem[];
  direction: PlanDirection;
};

/**
 * Juz' (para) boundaries: the surah:ayah each of the 30 ajza' begins at.
 * These are fixed by consensus, independent of Mushaf print/pagination —
 * unlike page numbers. Verified against api.alquran.cloud (Uthmani text) via
 * scripts/fetch-juz-boundaries.mjs / the "Verify Juz Boundaries" GitHub
 * Action — every entry below matches that live source exactly.
 */
const JUZ_START: { surah: number; ayah: number }[] = [
  { surah: 1, ayah: 1 }, // 1
  { surah: 2, ayah: 142 }, // 2
  { surah: 2, ayah: 253 }, // 3
  { surah: 3, ayah: 93 }, // 4
  { surah: 4, ayah: 24 }, // 5
  { surah: 4, ayah: 148 }, // 6
  { surah: 5, ayah: 82 }, // 7
  { surah: 6, ayah: 111 }, // 8
  { surah: 7, ayah: 88 }, // 9
  { surah: 8, ayah: 41 }, // 10
  { surah: 9, ayah: 93 }, // 11
  { surah: 11, ayah: 6 }, // 12
  { surah: 12, ayah: 53 }, // 13
  { surah: 15, ayah: 1 }, // 14
  { surah: 17, ayah: 1 }, // 15
  { surah: 18, ayah: 75 }, // 16
  { surah: 21, ayah: 1 }, // 17
  { surah: 23, ayah: 1 }, // 18
  { surah: 25, ayah: 21 }, // 19
  { surah: 27, ayah: 56 }, // 20
  { surah: 29, ayah: 46 }, // 21
  { surah: 33, ayah: 31 }, // 22
  { surah: 36, ayah: 28 }, // 23
  { surah: 39, ayah: 32 }, // 24
  { surah: 41, ayah: 47 }, // 25
  { surah: 46, ayah: 1 }, // 26
  { surah: 51, ayah: 31 }, // 27
  { surah: 58, ayah: 1 }, // 28
  { surah: 67, ayah: 1 }, // 29
  { surah: 78, ayah: 1 }, // 30
];

function cumulativeAyahsBefore(surahNumber: number): number {
  let sum = 0;
  for (const s of QURAN_SURAHS) {
    if (s.number >= surahNumber) break;
    sum += s.ayahCount;
  }
  return sum;
}

function globalOffset(surahNumber: number, ayahInSurah: number): number {
  return cumulativeAyahsBefore(surahNumber) + (ayahInSurah - 1);
}

function globalOffsetToPosition(offset: number): SurahPosition {
  let remaining = offset;
  for (const s of QURAN_SURAHS) {
    if (remaining < s.ayahCount) return { surahNumber: s.number, ayahInSurah: remaining + 1 };
    remaining -= s.ayahCount;
  }
  const last = QURAN_SURAHS[QURAN_SURAHS.length - 1];
  return { surahNumber: last.number, ayahInSurah: last.ayahCount };
}

function juzGlobalStart(juz: number): number {
  const b = JUZ_START[juz - 1];
  return globalOffset(b.surah, b.ayah);
}

function juzLength(juz: number): number {
  const start = juzGlobalStart(juz);
  const end = juz < 30 ? juzGlobalStart(juz + 1) : TOTAL_AYAHS;
  return end - start;
}

/**
 * Juz' order for memorization: "fromStart" follows the Mushaf order
 * (juz' 1 -> 30); "fromEnd" reverses it (juz' 30 -> 1) — juz' 30 first,
 * the common order for beginners. Within each juz', ayahs always stay in
 * their natural forward order regardless of direction (e.g. after
 * finishing juz' 30, the next ayah is the start of juz' 29 — not the end
 * of it).
 */
function remainingJuzList(alreadyMemorizedJuz: number, direction: PlanDirection): number[] {
  const all = Array.from({ length: 30 }, (_, i) => i + 1);
  const ordered = direction === "fromStart" ? all : [...all].reverse();
  const clamped = Math.max(0, Math.min(29, alreadyMemorizedJuz));
  return ordered.slice(clamped);
}

function sequenceIndexToPosition(sequenceIndex: number, remainingJuz: number[]): SurahPosition {
  let remaining = sequenceIndex;
  for (const juz of remainingJuz) {
    const len = juzLength(juz);
    if (remaining < len) {
      return globalOffsetToPosition(juzGlobalStart(juz) + remaining);
    }
    remaining -= len;
  }
  const lastJuz = remainingJuz[remainingJuz.length - 1];
  return globalOffsetToPosition(juzGlobalStart(lastJuz) + juzLength(lastJuz) - 1);
}

export function buildPlan(input: PlanInput): PlanResult {
  const remainingJuz = remainingJuzList(input.alreadyMemorizedJuz, input.direction);
  const remainingAyahs = remainingJuz.reduce((sum, j) => sum + juzLength(j), 0);

  const totalWeeks = Math.max(1, Math.round(input.durationMonths * WEEKS_PER_MONTH));
  const memorizationDaysPerWeek = 7 - input.reviewDaysPerWeek;
  const ayahsPerWeek = remainingAyahs / totalWeeks;
  const ayahsPerDay = ayahsPerWeek / memorizationDaysPerWeek;

  const weeks: WeekPlanItem[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const fromAyahIndex = Math.round(w * ayahsPerWeek);
    const toAyahIndex = Math.min(remainingAyahs, Math.round((w + 1) * ayahsPerWeek));
    if (fromAyahIndex >= toAyahIndex) continue;
    weeks.push({
      weekIndex: w + 1,
      fromAyahIndex,
      toAyahIndex,
      fromPosition: sequenceIndexToPosition(fromAyahIndex, remainingJuz),
      toPosition: sequenceIndexToPosition(toAyahIndex - 1, remainingJuz),
    });
  }

  return {
    totalWeeks,
    remainingAyahs,
    ayahsPerWeek,
    memorizationDaysPerWeek,
    ayahsPerDay,
    weeks,
    direction: input.direction,
  };
}

/** Which week (1-based) a given date falls into, counting from startDate. Returns null if the plan is finished. */
export function weekIndexForDate(plan: PlanResult, startDate: Date, targetDate: Date): number | null {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diffWeeks = Math.floor((targetDate.getTime() - startDate.getTime()) / msPerWeek);
  const weekIndex = Math.max(1, diffWeeks + 1);
  if (weekIndex > plan.totalWeeks) return null;
  return weekIndex;
}

export function getWeekPlan(plan: PlanResult, weekIndex: number): WeekPlanItem | undefined {
  return plan.weeks.find((w) => w.weekIndex === weekIndex);
}

export function overallProgressPercent(plan: PlanResult, currentWeekIndex: number | null): number {
  if (currentWeekIndex === null) return 100;
  const completedAyahs = getWeekPlan(plan, currentWeekIndex)?.fromAyahIndex ?? plan.remainingAyahs;
  return Math.round((completedAyahs / plan.remainingAyahs) * 100);
}
