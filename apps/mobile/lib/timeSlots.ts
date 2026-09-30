// Canonical time-of-day values ("HH:MM", 24h) used for teacher availability
// and booking slots. Mirrors lib/timeSlots.ts on the web app.

export const DEFAULT_AVAILABLE_TIMES = ["16:00", "17:30", "19:00", "20:30"];

export function formatTimeSlot(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h24 = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const isPm = h24 >= 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const suffix = isPm ? "م" : "ص";
  return `${h12}:${m} ${suffix}`;
}
