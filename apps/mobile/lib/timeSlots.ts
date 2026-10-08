// Canonical time-of-day values ("HH:MM", 24h) used for teacher availability
// and booking slots. Mirrors lib/timeSlots.ts on the web app.

// Every half hour from 08:00 to 22:00 — what a teacher can pick from.
export const TIME_SLOT_OPTIONS: string[] = Array.from({ length: 29 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

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
