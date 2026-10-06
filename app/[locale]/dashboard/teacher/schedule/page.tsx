"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import {
  getMyAvailableDays,
  getMyAvailableTimes,
  getMyTeacherId,
  getMyWhatsApp,
  updateMyAvailableDays,
  updateMyAvailableTimes,
  updateMyWhatsApp,
} from "@/lib/supabase/teacherStudents";
import { normalizeWhatsAppNumber } from "@/lib/contact";
import { listTeacherBookings, TeacherBooking } from "@/lib/supabase/bookings";
import { TIME_SLOT_OPTIONS, formatTimeSlot } from "@/lib/timeSlots";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import PulseBadge from "@/components/dashboard/PulseBadge";
import { useLiveRooms } from "@/lib/supabase/presence";
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
  const liveRooms = useLiveRooms();

  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [ready, setReady] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [savingTimes, setSavingTimes] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const dayLabels = tc.raw("weekDaysSaturdayFirst") as string[];

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
      const [rows, times, days, myWhatsapp] = await Promise.all([
        listTeacherBookings(supabase, tId),
        getMyAvailableTimes(supabase, tId),
        getMyAvailableDays(supabase, tId),
        getMyWhatsApp(supabase, tId),
      ]);
      if (cancelled) return;
      setBookings(rows);
      setAvailableTimes(times);
      setAvailableDays(days);
      setWhatsapp(myWhatsapp ? `+${myWhatsapp}` : "");
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

  function toggleDay(dayIndex: number) {
    setAvailableDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  }

  async function handleSaveTimes() {
    if (!teacherId) return;
    setSavingTimes(true);
    const supabase = createClient();
    const [okTimes, okDays] = await Promise.all([
      updateMyAvailableTimes(supabase, teacherId, availableTimes),
      updateMyAvailableDays(supabase, teacherId, availableDays),
    ]);
    setSavingTimes(false);
    const ok = okTimes && okDays;
    showToast(ok ? t("toastAvailabilitySaved") : t("errorAvailabilitySaved"), ok ? "success" : "error");
  }

  async function handleSaveWhatsapp() {
    if (!teacherId) return;
    const trimmed = whatsapp.trim();
    const normalized = trimmed ? normalizeWhatsAppNumber(trimmed) : null;
    if (trimmed && !normalized) {
      showToast(t("whatsappContactInvalid"), "error");
      return;
    }
    setSavingWhatsapp(true);
    const ok = await updateMyWhatsApp(createClient(), teacherId, normalized);
    setSavingWhatsapp(false);
    if (!ok) {
      showToast(t("errorWhatsappSaved"), "error");
      return;
    }
    setWhatsapp(normalized ? `+${normalized}` : "");
    showToast(normalized ? t("toastWhatsappSaved") : t("toastWhatsappCleared"), "success");
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

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-ink-soft">{t("availableDaysLabel")}</span>
            <div className="flex flex-wrap gap-2">
              {dayLabels.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDay(i)}
                  aria-pressed={availableDays.includes(i)}
                  className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                    availableDays.includes(i)
                      ? "bg-gold-gradient text-white shadow-soft"
                      : "border border-line bg-bg text-ink-soft hover:text-gold-dark"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-ink-soft">{t("availableTimesLabel")}</span>
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

      {ready && teacherId && (
        <div className="card mb-6 flex flex-col gap-4 p-6">
          <div>
            <h3 className="text-sm font-extrabold text-ink">{t("whatsappContactTitle")}</h3>
            <p className="mt-1 text-xs text-ink-soft">{t("whatsappContactSubtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              aria-label={t("whatsappContactTitle")}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={t("whatsappContactPlaceholder")}
              className="input max-w-xs"
            />
            <button onClick={handleSaveWhatsapp} disabled={savingWhatsapp} className="btn-primary disabled:opacity-70">
              {savingWhatsapp ? t("savingAvailability") : t("saveWhatsappCta")}
            </button>
          </div>
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
                    <div className="mb-1 flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gold-dark">
                        <IconClock className="h-3.5 w-3.5" />
                        {b.time}
                      </span>
                      {(liveRooms.get(b.id)?.studentCount ?? 0) > 0 && <PulseBadge color="red" label={tc("liveNowBadge")} />}
                    </div>
                    <div className="mb-3 text-sm font-bold text-ink">{b.studentName || tc("dash")}</div>
                    <JoinMeetingButton
                      room={b.id}
                      displayName={teacherName}
                      subject={b.studentName}
                      label={t("startSessionCta")}
                      className="w-full justify-center"
                      lobby
                      role="teacher"
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
