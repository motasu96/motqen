"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { groupSessions } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconCalendar, IconClock, IconFamily } from "@/components/icons";

const DAYS_ORDER = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function TeacherGroupsPage() {
  const teacherNav = useTeacherNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const dayLabels = tc.raw("weekDaysSaturdayFirst") as string[];

  return (
    <DashboardShell navItems={teacherNav} userName={tc("teacherName")} userSubtitle={tc("teacherTitle")}>
      <DashboardPageHeader title={t("groupsTitle")} subtitle={t("groupsSubtitle")} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groupSessions.map((g0) => {
          const g = localize(g0, locale);
          const dayIndex = DAYS_ORDER.indexOf(g0.day);
          const dayLabel = dayLabels[dayIndex] ?? g0.day;
          const enrolledNames = localize(g0, locale).enrolledStudents;

          return (
            <div key={g0.id} className="card flex flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
                    <IconFamily className="h-5 w-5 text-gold-dark" />
                  </span>
                  <div>
                    <span className="badge mb-1.5 w-fit">{g.program}</span>
                    <h3 className="text-base font-extrabold leading-snug text-ink">{g.title}</h3>
                  </div>
                </div>
                <span className="shrink-0 rounded-pill bg-bg px-3 py-1 text-xs font-bold text-ink-soft">
                  {g0.enrolledStudents.length} / {g0.capacity}
                </span>
              </div>

              <div className="flex flex-col gap-2 border-y border-line py-4 text-sm">
                <div className="flex items-center gap-2 text-ink-soft">
                  <IconCalendar className="h-4 w-4 text-gold" />
                  {dayLabel} · {g.time}
                </div>
                <div className="flex items-center gap-2 text-ink-soft">
                  <IconClock className="h-4 w-4 text-gold" />
                  {tc("capacityLabel")}: {g0.capacity}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-extrabold text-ink-soft">{tc("enrolledLabel")}</h4>
                {enrolledNames.length === 0 ? (
                  <p className="text-xs text-ink-soft">—</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {enrolledNames.map((name) => (
                      <span key={name} className="badge">{name}</span>
                    ))}
                  </div>
                )}
              </div>

              <JoinMeetingButton
                room={g0.id}
                displayName={tc("teacherName")}
                subject={g.title}
                label={t("startGroupSession")}
                className="w-full justify-center"
              />
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
