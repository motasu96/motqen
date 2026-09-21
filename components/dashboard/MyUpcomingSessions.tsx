"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/components/Toast";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { UpcomingBooking } from "@/lib/supabase/bookings";
import { IconCalendar, IconCheck } from "@/components/icons";

export default function MyUpcomingSessions({
  upcoming,
  ready,
  onCancel,
  displayName,
}: {
  upcoming: UpcomingBooking[];
  ready: boolean;
  onCancel: (id: string) => void;
  displayName: string;
}) {
  const { showToast } = useToast();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  async function handleCancel(id: string) {
    onCancel(id);
    showToast(t("toastCancelled"), "info");
  }

  return (
    <div className="card flex flex-col gap-5 p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
          <IconCalendar className="h-5 w-5 text-gold-dark" />
          {t("upcomingSessionsTitle")}
        </h3>
        <Link href="/teachers" className="text-xs font-bold text-gold-dark hover:underline">
          {t("bookNewSessionCta")}
        </Link>
      </div>

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
                <JoinMeetingButton room={b.id} displayName={displayName} subject={t("sessionSubject")} label={tc("join")} />
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
  );
}
