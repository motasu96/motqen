// Memorization plan calculator.
//
// We schedule in units of "quarter-hizb" (ربع الحزب): every standard Mushaf
// prints 30 juz', each split into 2 hizb, each split into 4 quarters — 240
// quarters total. This structural division is invariant across Mushaf
// editions, unlike page numbers (which vary by print/font), so it's the
// safest unit for a generated schedule without needing a verified per-ayah
// dataset.

export const TOTAL_JUZ = 30;
export const QUARTERS_PER_JUZ = 8;
export const TOTAL_QUARTERS = TOTAL_JUZ * QUARTERS_PER_JUZ; // 240

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

export type JuzPosition = {
  juz: number; // 1..30, absolute juz number (juz' order, not memorization order)
  // 1..8: the Nth rub'-al-hizb within this juz', counting across both of its
  // hizb (2 hizb x 4 rub' each). Split into hizb/rub' for display via
  // Math.ceil(quarterInJuz / 4) and ((quarterInJuz - 1) % 4) + 1.
  quarterInJuz: number;
};

export type WeekPlanItem = {
  weekIndex: number; // 1-based
  fromQuarter: number; // 0-based index into the memorization-order sequence
  toQuarter: number; // exclusive
  fromPosition: JuzPosition;
  toPosition: JuzPosition; // inclusive end position
};

export type PlanResult = {
  totalWeeks: number;
  remainingQuarters: number;
  quartersPerWeek: number;
  memorizationDaysPerWeek: number;
  quartersPerDay: number;
  weeks: WeekPlanItem[];
  direction: PlanDirection;
};

/**
 * Absolute juz'/quarter position at a given point in the memorization-order
 * sequence. The juz' order reverses for "fromEnd" (juz 30 down to 1), but
 * quarters within each juz' always stay in their natural forward order.
 */
function sequenceIndexToJuzPosition(sequenceIndex: number, direction: PlanDirection): JuzPosition {
  const juzOrderPosition = Math.floor(sequenceIndex / QUARTERS_PER_JUZ);
  const quarterInJuz = (sequenceIndex % QUARTERS_PER_JUZ) + 1;
  const juz = direction === "fromStart" ? juzOrderPosition + 1 : TOTAL_JUZ - juzOrderPosition;
  return { juz, quarterInJuz };
}

export function buildPlan(input: PlanInput): PlanResult {
  const alreadyMemorizedQuarters = Math.max(0, Math.min(TOTAL_JUZ - 1, input.alreadyMemorizedJuz)) * QUARTERS_PER_JUZ;
  const remainingQuarters = TOTAL_QUARTERS - alreadyMemorizedQuarters;

  const totalWeeks = Math.max(1, Math.round(input.durationMonths * WEEKS_PER_MONTH));
  const memorizationDaysPerWeek = 7 - input.reviewDaysPerWeek;
  const quartersPerWeek = remainingQuarters / totalWeeks;
  const quartersPerDay = quartersPerWeek / memorizationDaysPerWeek;

  const weeks: WeekPlanItem[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const fromQuarter = Math.round(w * quartersPerWeek);
    const toQuarter = Math.min(remainingQuarters, Math.round((w + 1) * quartersPerWeek));
    if (fromQuarter >= toQuarter) continue;
    weeks.push({
      weekIndex: w + 1,
      fromQuarter,
      toQuarter,
      fromPosition: sequenceIndexToJuzPosition(alreadyMemorizedQuarters + fromQuarter, input.direction),
      toPosition: sequenceIndexToJuzPosition(alreadyMemorizedQuarters + toQuarter - 1, input.direction),
    });
  }

  return {
    totalWeeks,
    remainingQuarters,
    quartersPerWeek,
    memorizationDaysPerWeek,
    quartersPerDay,
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
  const completedQuarters = getWeekPlan(plan, currentWeekIndex)?.fromQuarter ?? plan.remainingQuarters;
  return Math.round((completedQuarters / plan.remainingQuarters) * 100);
}
