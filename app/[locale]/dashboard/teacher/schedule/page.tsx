"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { teacherSchedule } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconClock } from "@/components/icons";

const DAYS_ORDER = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function TeacherSchedulePage() {
  const teacherNav = useTeacherNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const dayLabels = tc.raw("weekDaysSaturdayFirst") as string[];

  const byDay = DAYS_ORDER.map((day, i) => ({
    day,
    label: dayLabels[i],
    slots: teacherSchedule.filter((s) => s.day === day),
  }));

  return (
    <DashboardShell navItems={teacherNav} userName={tc("teacherName")} userSubtitle={tc("teacherTitle")}>
      <DashboardPageHeader title={t("scheduleTitle")} subtitle={t("scheduleSubtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {byDay.map(({ day, label, slots }) => (
          <div key={day} className="card flex flex-col gap-3 p-5">
            <h3 className="text-sm font-extrabold text-ink">{label}</h3>
            {slots.length === 0 ? (
              <p className="text-xs text-ink-soft">{t("noSessions")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {slots.map((s0) => {
                  const s = localize(s0, locale);
                  return (
                    <div key={s.id} className="rounded-2xl border border-line bg-bg p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gold-dark">
                        <IconClock className="h-3.5 w-3.5" />
                        {s.time}
                      </div>
                      <div className="text-sm font-bold text-ink">{s.student}</div>
                      <div className="mb-3 text-xs text-ink-soft">{s.program}</div>
                      <JoinMeetingButton
                        room={s0.id}
                        displayName={tc("teacherName")}
                        subject={`${s.student} — ${s.program}`}
                        label={t("startSessionCta")}
                        className="w-full justify-center"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
