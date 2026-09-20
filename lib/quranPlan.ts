// Memorization plan calculator.
//
// Schedules are built in units of ayahs, grouped by surah. Ayah counts per
// surah are fixed in the standard Hafs 'an Asim numbering used in virtually
// every printed Mushaf, unlike page/line boundaries which vary by print
// edition — so this doesn't require a verified page-mapping dataset to
// produce a correct, safe schedule.

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
  alreadyMemorizedJuz: number; // 0..29, juz' already done, from the front of the direction-ordered sequence
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
 * Surah order for memorization: "fromStart" follows the Mushaf order
 * (Al-Fatihah -> An-Nas); "fromEnd" reverses it (An-Nas -> Al-Fatihah),
 * which starts with the short surahs at the back of the Mushaf — the
 * common order for beginners. Ayahs within each surah always stay in
 * their natural forward order regardless of direction.
 */
function orderedSurahs(direction: PlanDirection) {
  return direction === "fromStart" ? QURAN_SURAHS : [...QURAN_SURAHS].reverse();
}

function surahsToAyahOffset(count: number, direction: PlanDirection): number {
  const ordered = orderedSurahs(direction);
  const clamped = Math.max(0, Math.min(ordered.length - 1, count));
  let sum = 0;
  for (let i = 0; i < clamped; i++) sum += ordered[i].ayahCount;
  return sum;
}

/**
 * Converts "N juz' already memorized" into a whole number of already-done
 * surahs, by proportionally estimating how many ayahs N/30 of the Quran
 * represents and rounding DOWN to the nearest complete surah boundary.
 * This avoids needing a separate juz'-boundary dataset (which falls
 * mid-surah) while still letting students answer in the unit they think in.
 */
function juzToSurahCount(juz: number, direction: PlanDirection): number {
  const clampedJuz = Math.max(0, Math.min(29, juz));
  const targetAyahs = Math.round((clampedJuz / 30) * TOTAL_AYAHS);
  const ordered = orderedSurahs(direction);
  let sum = 0;
  let count = 0;
  for (const surah of ordered) {
    if (sum + surah.ayahCount > targetAyahs) break;
    sum += surah.ayahCount;
    count++;
  }
  return count;
}

function sequenceIndexToPosition(sequenceIndex: number, direction: PlanDirection): SurahPosition {
  const ordered = orderedSurahs(direction);
  let remaining = sequenceIndex;
  for (const surah of ordered) {
    if (remaining < surah.ayahCount) {
      return { surahNumber: surah.number, ayahInSurah: remaining + 1 };
    }
    remaining -= surah.ayahCount;
  }
  const last = ordered[ordered.length - 1];
  return { surahNumber: last.number, ayahInSurah: last.ayahCount };
}

export function buildPlan(input: PlanInput): PlanResult {
  const alreadyMemorizedSurahs = juzToSurahCount(input.alreadyMemorizedJuz, input.direction);
  const alreadyMemorizedAyahs = surahsToAyahOffset(alreadyMemorizedSurahs, input.direction);
  const remainingAyahs = TOTAL_AYAHS - alreadyMemorizedAyahs;

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
      fromPosition: sequenceIndexToPosition(alreadyMemorizedAyahs + fromAyahIndex, input.direction),
      toPosition: sequenceIndexToPosition(alreadyMemorizedAyahs + toAyahIndex - 1, input.direction),
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
