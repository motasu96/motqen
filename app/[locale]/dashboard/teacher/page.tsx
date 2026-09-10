"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { teacherStudents, TeacherStudent } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconCalendar, IconChart, IconTask, IconUsers, IconShield } from "@/components/icons";

const STATUS_KEYS: Record<TeacherStudent["status"], "personRegular" | "personLate" | "personStruggling"> = {
  منتظم: "personRegular",
  متأخر: "personLate",
  متعثر: "personStruggling",
};

const STATUS_STYLES: Record<TeacherStudent["status"], string> = {
  منتظم: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  متأخر: "bg-gold-light text-gold-dark",
  متعثر: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
};

export default function TeacherDashboardPage() {
  const teacherNav = useTeacherNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  const STATS = [
    { icon: IconUsers, value: "125", label: t("statTotalStudents") },
    { icon: IconCalendar, value: "4", label: t("statTodaySessions") },
    { icon: IconTask, value: "18", label: t("statPendingHomework") },
    { icon: IconChart, value: "12", label: t("statCompletedSessions") },
  ];

  const previewStudents = teacherStudents.slice(0, 4).map((s) => ({ raw: s, l: localize(s, locale) }));

  return (
    <DashboardShell navItems={teacherNav} userName={tc("teacherName")} userSubtitle={tc("teacherTitle")}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{t("dashboardTitle")}</h1>
          <p className="text-sm text-ink-soft">{t("dashboardSubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="card flex flex-col gap-3 p-5 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-light">
                <s.icon className="h-5 w-5 text-gold-dark" />
              </span>
              <span className="text-2xl font-extrabold text-ink">{s.value}</span>
              <span className="text-xs text-ink-soft">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
              <IconShield className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-ink">{t("directTitle")}</h3>
              <p className="text-sm text-ink-soft">{t("directDesc")}</p>
            </div>
          </div>
          <JoinMeetingButton
            room="teacher-abdullah-alsalmi"
            displayName={tc("teacherName")}
            subject={t("directSubject")}
            label={t("directCta")}
            lobby
            className="shrink-0 justify-center"
          />
        </div>

        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between p-6">
            <h3 className="text-base font-extrabold text-ink">{t("studentsListTitle")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-line bg-bg text-ink-soft">
                  <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("lastSession")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("action")}</th>
                </tr>
              </thead>
              <tbody>
                {previewStudents.map(({ raw, l }) => (
                  <tr key={raw.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{l.name}</td>
                    <td className="px-6 py-4 text-ink-soft">{raw.lastSession}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[raw.status]}`}>
                        {tStatus(STATUS_KEYS[raw.status])}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-bold text-gold-dark hover:underline">{tc("viewProfile")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
