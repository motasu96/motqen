"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/components/Toast";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { createClient } from "@/lib/supabase/client";
import { createBooking, getTakenSlots } from "@/lib/supabase/bookings";
import { useUpcomingBookings } from "@/lib/supabase/useUpcomingBookings";
import { IconCalendar, IconCheck, IconClock, IconFamily } from "@/components/icons";

const HOLD_DURATION_MS = 10 * 60 * 1000;

function buildNextDays(count: number, dayLabels: string[]) {
  const days: { iso: string; label: string; dayNum: number }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ iso: d.toISOString().slice(0, 10), label: dayLabels[d.getDay()], dayNum: d.getDate() });
  }
  return days;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type BookingType = "trial" | "group";

export default function BookingCalendar({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  const { showToast } = useToast();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  const TIME_SLOTS = tc.raw("timeSlots") as string[];
  const DAY_LABELS = tc.raw("weekDaysShort") as string[];

  const days = useMemo(() => buildNextDays(7, DAY_LABELS), [DAY_LABELS]);
  const [bookingType, setBookingType] = useState<BookingType>("trial");
  const [selectedDay, setSelectedDay] = useState(days[0].iso);
  const [confirmedFlash, setConfirmedFlash] = useState<string | null>(null);
  const [pendingSlot, setPendingSlot] = useState<{ day: string; time: string; expiresAt: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [slotsReady, setSlotsReady] = useState(false);
  const { upcoming, ready, cancel, reload } = useUpcomingBookings();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      setStudentId(user.id);
      const [taken, { data: profile }] = await Promise.all([
        getTakenSlots(supabase, teacherId, days[0].iso, days[days.length - 1].iso),
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      ]);
      if (cancelled) return;
      setTakenSlots(taken);
      setStudentName((profile?.full_name as string | null) ?? null);
      setSlotsReady(true);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  useEffect(() => {
    if (!pendingSlot) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [pendingSlot]);

  useEffect(() => {
    if (pendingSlot && now >= pendingSlot.expiresAt) {
      setPendingSlot(null);
      showToast(t("toastHoldExpired"), "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, pendingSlot]);

  const BOOKING_TYPES: { key: BookingType; label: string }[] = [
    { key: "trial", label: t("bookingTypeTrial") },
    { key: "group", label: t("bookingTypeGroup") },
  ];

  function isSlotTaken(day: string, time: string) {
    return takenSlots.has(`${day}__${time}`);
  }

  function handleSelectSlot(time: string) {
    if (isSlotTaken(selectedDay, time)) {
      showToast(t("toastSlotTaken"), "error");
      return;
    }
    setPendingSlot({ day: selectedDay, time, expiresAt: Date.now() + HOLD_DURATION_MS });
  }

  async function handleConfirmHold() {
    if (!pendingSlot || !studentId) return;
    setSubmitting(true);
    const { booking, error } = await createBooking(createClient(), {
      studentId,
      teacherId,
      date: pendingSlot.day,
      time: pendingSlot.time,
    });
    setSubmitting(false);
    if (error === "slot_taken") {
      setTakenSlots((prev) => new Set(prev).add(`${pendingSlot.day}__${pendingSlot.time}`));
      showToast(t("toastSlotTaken"), "error");
      setPendingSlot(null);
      return;
    }
    if (error || !booking) {
      showToast(t("toastSlotTaken"), "error");
      return;
    }
    setTakenSlots((prev) => new Set(prev).add(`${pendingSlot.day}__${pendingSlot.time}`));
    await reload();
    setConfirmedFlash(pendingSlot.time);
    showToast(t("toastBooked", { date: pendingSlot.day, time: pendingSlot.time }), "success");
    setPendingSlot(null);
    setTimeout(() => setConfirmedFlash(null), 1800);
  }

  function handleCancelHold() {
    setPendingSlot(null);
  }

  async function handleCancel(id: string) {
    const removed = upcoming.find((b) => b.id === id);
    const ok = await cancel(id);
    if (!ok) return;
    if (removed) {
      setTakenSlots((prev) => {
        const next = new Set(prev);
        next.delete(`${removed.date}__${removed.time}`);
        return next;
      });
    }
    showToast(t("toastCancelled"), "info");
  }

  return (
    <div className="card flex flex-col gap-6 p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <IconCalendar className="h-5 w-5 text-gold-dark" />
            {t("bookingTitle")}
          </h3>
          <p className="mt-1 text-xs text-ink-soft">{tc("with")} {teacherName}</p>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1"
        role="group"
        aria-label={t("bookingTitle")}
      >
        {BOOKING_TYPES.map((bt) => (
          <button
            key={bt.key}
            type="button"
            onClick={() => setBookingType(bt.key)}
            aria-pressed={bookingType === bt.key}
            className={`rounded-pill px-2 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
              bookingType === bt.key ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
            }`}
          >
            {bt.label}
          </button>
        ))}
      </div>

      {bookingType === "group" && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-bg p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-light">
            <IconFamily className="h-5 w-5 text-gold-dark" />
          </span>
          <div>
            <h4 className="text-sm font-extrabold text-ink">{t("bookingTypeGroupTitle")}</h4>
            <p className="text-sm text-ink-soft">{t("bookingTypeGroupDesc")}</p>
          </div>
          <Link href="/dashboard/student/groups" className="btn-outline">
            {t("bookingTypeGroupCta")}
          </Link>
        </div>
      )}

      {bookingType === "trial" && (
        <>
          <p className="text-xs text-ink-soft">{t("bookingTypeTrialNote")}</p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => (
              <button
                key={d.iso}
                onClick={() => setSelectedDay(d.iso)}
                aria-pressed={selectedDay === d.iso}
                aria-label={t("bookingDaySelectAria", { label: d.label, num: d.dayNum })}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border px-4 py-3 text-center transition-colors ${
                  selectedDay === d.iso ? "border-gold bg-gold-light" : "border-line bg-bg hover:border-gold/60"
                }`}
              >
                <span className="text-xs text-ink-soft">{d.label}</span>
                <span className="text-sm font-extrabold text-ink">{d.dayNum}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TIME_SLOTS.map((time) => {
              const taken = slotsReady && isSlotTaken(selectedDay, time);
              const justConfirmed = confirmedFlash === time;
              const isPending = pendingSlot?.day === selectedDay && pendingSlot?.time === time;
              return (
                <button
                  key={time}
                  disabled={taken}
                  onClick={() => handleSelectSlot(time)}
                  aria-label={taken ? t("bookingSlotTakenAria", { time }) : t("bookingSlotFreeAria", { time })}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm font-bold transition-colors ${
                    taken
                      ? "cursor-not-allowed border-line bg-bg text-ink-soft/60"
                      : justConfirmed
                      ? "animate-confirm-pulse border-gold bg-gold-gradient text-white"
                      : isPending
                      ? "border-gold bg-gold-light text-gold-dark"
                      : "border-line bg-bg text-ink hover:border-gold hover:text-gold-dark"
                  }`}
                >
                  <IconClock className="h-4 w-4" />
                  {time}
                  {taken && <span className="text-[10px] font-normal">{t("bookingSlotTaken")}</span>}
                  {justConfirmed && <span className="text-[10px] font-normal">{t("bookingSlotConfirmed")}</span>}
                </button>
              );
            })}
          </div>

          {pendingSlot && (
            <div className="animate-fade-up flex flex-col gap-3 rounded-2xl border border-gold bg-gold-light p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-ink">{t("pendingHoldTitle")}</h4>
                  <p className="text-sm text-ink">{pendingSlot.day} — {pendingSlot.time}</p>
                </div>
                <div className="text-end">
                  <p className="text-[11px] text-ink-soft">{t("pendingHoldExpiresIn")}</p>
                  <p dir="ltr" className="text-lg font-extrabold text-gold-dark">
                    {formatCountdown(pendingSlot.expiresAt - now)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handleConfirmHold} disabled={submitting} className="btn-primary disabled:opacity-70">
                  {t("pendingHoldConfirm")}
                </button>
                <button onClick={handleCancelHold} className="text-sm font-bold text-ink-soft hover:text-gold-dark">
                  {t("pendingHoldCancel")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="border-t border-line pt-5">
        <h4 className="mb-3 text-sm font-extrabold text-ink">{t("upcomingSessionsTitle")}</h4>
        {!ready ? null : upcoming.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light">
              <IconCalendar className="h-4 w-4 text-gold-dark" />
            </span>
            <p className="text-sm text-ink-soft">{t("noUpcomingSessions")}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-2xl border border-line bg-bg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-light">
                    <IconCheck className="h-4 w-4 text-gold-dark" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-ink">{b.date} — {b.time}</div>
                    <div className="text-xs text-ink-soft">{tc("with")} {b.teacherName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <JoinMeetingButton room={b.id} displayName={studentName || tc("studentName")} subject={t("sessionSubject")} label={tc("join")} />
                  <button
                    onClick={() => handleCancel(b.id)}
                    aria-label={t("cancelSessionAria", { date: b.date, time: b.time })}
                    className="text-xs font-bold text-ink-soft transition-colors hover:text-red-500"
                  >
                    {tc("cancel")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
