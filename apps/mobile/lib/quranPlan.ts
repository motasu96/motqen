// Memorization plan calculator — used here only to derive the "overall
// memorization" percent shown on the Reports screen. Kept in sync by hand
// with ../../lib/quranPlan.ts on the web app; see that file for the fuller
// explanation of the juz'-boundary math.

import { QURAN_SURAHS, TOTAL_AYAHS } from "./quranSurahs";

const WEEKS_PER_MONTH = 4.345; // 365.25 / 12 / 7

export type PlanDirection = "fromStart" | "fromEnd";

export type PlanInput = {
  durationMonths: number;
  alreadyMemorizedJuz: number; // 0..29
  reviewDaysPerWeek: 1 | 2;
  direction: PlanDirection;
};

export type SurahPosition = {
  surahNumber: number;
  ayahInSurah: number;
};

export type WeekPlanItem = {
  weekIndex: number;
  fromAyahIndex: number;
  toAyahIndex: number;
  fromPosition: SurahPosition;
  toPosition: SurahPosition;
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

const JUZ_START: { surah: number; ayah: number }[] = [
  { surah: 1, ayah: 1 },
  { surah: 2, ayah: 142 },
  { surah: 2, ayah: 253 },
  { surah: 3, ayah: 93 },
  { surah: 4, ayah: 24 },
  { surah: 4, ayah: 148 },
  { surah: 5, ayah: 82 },
  { surah: 6, ayah: 111 },
  { surah: 7, ayah: 88 },
  { surah: 8, ayah: 41 },
  { surah: 9, ayah: 93 },
  { surah: 11, ayah: 6 },
  { surah: 12, ayah: 53 },
  { surah: 15, ayah: 1 },
  { surah: 17, ayah: 1 },
  { surah: 18, ayah: 75 },
  { surah: 21, ayah: 1 },
  { surah: 23, ayah: 1 },
  { surah: 25, ayah: 21 },
  { surah: 27, ayah: 56 },
  { surah: 29, ayah: 46 },
  { surah: 33, ayah: 31 },
  { surah: 36, ayah: 28 },
  { surah: 39, ayah: 32 },
  { surah: 41, ayah: 47 },
  { surah: 46, ayah: 1 },
  { surah: 51, ayah: 31 },
  { surah: 58, ayah: 1 },
  { surah: 67, ayah: 1 },
  { surah: 78, ayah: 1 },
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
