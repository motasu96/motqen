// Route to the video room screen as a teacher (lobby on). `logOnLeave`
// sends the teacher back to their home screen with that session open for
// logging, mirroring the web "log on leave" behaviour.
export function teacherRoomHref(room: string, subject: string, logOnLeave: boolean, returnTo: "home" | "groups" = "home") {
  const q = `role=teacher&subject=${encodeURIComponent(subject)}${logOnLeave ? `&log=1&ret=${returnTo}` : ""}`;
  return `/room/${encodeURIComponent(room)}?${q}`;
}

// Date fields are plain text (YYYY-MM-DD) to avoid a native date-picker
// dependency; this validates them before they reach the database.
export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
