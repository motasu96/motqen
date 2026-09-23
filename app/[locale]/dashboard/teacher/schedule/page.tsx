"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { getMyAvailableTimes, getMyTeacherId, updateMyAvailableTimes } from "@/lib/supabase/teacherStudents";
import { listTeacherBookings, TeacherBooking } from "@/lib/supabase/bookings";
import { TIME_SLOT_OPTIONS, formatTimeSlot } from "@/lib/timeSlots";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { useToast } from "@/components/Toast";
import { IconClock } from "@/components/icons";

export default function TeacherSchedulePage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [ready, setReady] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [savingTimes, setSavingTimes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setReady(true);
        return;
      }
      const tId = await getMyTeacherId(supabase, user.id);
      if (!tId || cancelled) {
        setReady(true);
        return;
      }
      setTeacherId(tId);
      const [rows, times] = await Promise.all([
        listTeacherBookings(supabase, tId),
        getMyAvailableTimes(supabase, tId),
      ]);
      if (cancelled) return;
      setBookings(rows);
      setAvailableTimes(times);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleTime(hhmm: string) {
    setAvailableTimes((prev) =>
      prev.includes(hhmm) ? prev.filter((v) => v !== hhmm) : [...prev, hhmm].sort()
    );
  }

  async function handleSaveTimes() {
    if (!teacherId) return;
    setSavingTimes(true);
    const ok = await updateMyAvailableTimes(createClient(), teacherId, availableTimes);
    setSavingTimes(false);
    showToast(ok ? t("toastAvailabilitySaved") : t("errorAvailabilitySaved"), ok ? "success" : "error");
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today);

  const byDate = new Map<string, TeacherBooking[]>();
  for (const b of upcoming) {
    const arr = byDate.get(b.date) ?? [];
    arr.push(b);
    byDate.set(b.date, arr);
  }
  const dates = Array.from(byDate.keys()).sort();

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("scheduleTitle")} subtitle={t("scheduleSubtitle")} />

      {ready && (
        <div className="card mb-6 flex flex-col gap-4 p-6">
          <div>
            <h3 className="text-sm font-extrabold text-ink">{t("availabilityTitle")}</h3>
            <p className="mt-1 text-xs text-ink-soft">{t("availabilitySubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOT_OPTIONS.map((hhmm) => (
              <button
                key={hhmm}
                type="button"
                onClick={() => toggleTime(hhmm)}
                aria-pressed={availableTimes.includes(hhmm)}
                className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                  availableTimes.includes(hhmm)
                    ? "bg-gold-gradient text-white shadow-soft"
                    : "border border-line bg-bg text-ink-soft hover:text-gold-dark"
                }`}
              >
                {formatTimeSlot(hhmm, locale)}
              </button>
            ))}
          </div>
          <button
            onClick={handleSaveTimes}
            disabled={savingTimes || availableTimes.length === 0}
            className="btn-primary self-start disabled:opacity-70"
          >
            {savingTimes ? t("savingAvailability") : t("saveAvailabilityCta")}
          </button>
        </div>
      )}

      {!ready ? null : dates.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noSessions")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dates.map((date) => (
            <div key={date} className="card flex flex-col gap-3 p-5">
              <h3 className="text-sm font-extrabold text-ink">{date}</h3>
              <div className="flex flex-col gap-2">
                {(byDate.get(date) ?? []).map((b) => (
                  <div key={b.id} className="rounded-2xl border border-line bg-bg p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gold-dark">
                      <IconClock className="h-3.5 w-3.5" />
                      {b.time}
                    </div>
                    <div className="mb-3 text-sm font-bold text-ink">{b.studentName || tc("dash")}</div>
                    <JoinMeetingButton
                      room={b.id}
                      displayName={teacherName}
                      subject={b.studentName}
                      label={t("startSessionCta")}
                      className="w-full justify-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
