"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useBookings } from "@/lib/useBookings";
import { useToast } from "@/components/Toast";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { IconCalendar, IconCheck, IconClock } from "@/components/icons";

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

export default function BookingCalendar() {
  const { addBooking, cancelBooking, isSlotTaken, upcoming, ready } = useBookings();
  const { showToast } = useToast();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  const TIME_SLOTS = tc.raw("timeSlots") as string[];
  const DAY_LABELS = tc.raw("weekDaysShort") as string[];
  const TEACHER = tc("teacherName");

  const days = useMemo(() => buildNextDays(7, DAY_LABELS), [DAY_LABELS]);
  const [selectedDay, setSelectedDay] = useState(days[0].iso);
  const [confirmedFlash, setConfirmedFlash] = useState<string | null>(null);

  function handleBook(time: string) {
    if (isSlotTaken(selectedDay, time)) {
      showToast(t("toastSlotTaken"), "error");
      return;
    }
    addBooking(selectedDay, time, TEACHER);
    setConfirmedFlash(time);
    setTimeout(() => setConfirmedFlash(null), 1800);
    showToast(t("toastBooked", { date: selectedDay, time }), "success");
  }

  function handleCancel(id: string) {
    cancelBooking(id);
    showToast(t("toastCancelled"), "info");
  }

  return (
    <div className="card flex flex-col gap-6 p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
          <IconCalendar className="h-5 w-5 text-gold-dark" />
          {t("bookingTitle")}
        </h3>
      </div>

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
          const taken = ready && isSlotTaken(selectedDay, time);
          const justConfirmed = confirmedFlash === time;
          return (
            <button
              key={time}
              disabled={taken}
              onClick={() => handleBook(time)}
              aria-label={taken ? t("bookingSlotTakenAria", { time }) : t("bookingSlotFreeAria", { time })}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm font-bold transition-colors ${
                taken
                  ? "cursor-not-allowed border-line bg-bg text-ink-soft/60"
                  : justConfirmed
                  ? "animate-confirm-pulse border-gold bg-gold-gradient text-white"
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

      <div className="border-t border-line pt-5">
        <h4 className="mb-3 text-sm font-extrabold text-ink">{t("upcomingSessionsTitle")}</h4>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("noUpcomingSessions")}</p>
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
                    <div className="text-xs text-ink-soft">{tc("with")} {b.teacher}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <JoinMeetingButton room={b.id} displayName={tc("studentName")} subject={t("sessionSubject")} label={tc("join")} />
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
