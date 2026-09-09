"use client";

import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { teacherStudents } from "@/data/dashboard";
import { IconChart } from "@/components/icons";

const avgProgress = Math.round(
  teacherStudents.reduce((sum, s) => sum + s.progress, 0) / teacherStudents.length
);

const WEEKLY_SESSIONS = [
  { week: 1, sessions: 10 },
  { week: 2, sessions: 12 },
  { week: 3, sessions: 9 },
  { week: 4, sessions: 15 },
];

const maxSessions = Math.max(...WEEKLY_SESSIONS.map((w) => w.sessions));

export default function TeacherReportsPage() {
  const teacherNav = useTeacherNav();
  const t = useTranslations("Dashboard.teacher");
  const ts = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  const STATS = [
    { label: t("statAvgProgress"), value: `${avgProgress}%` },
    { label: t("statMonthlyAttendance"), value: "94%" },
    { label: t("statStudentRating"), value: "4.9 / 5" },
    { label: t("statCompletedThisMonth"), value: "46" },
  ];

  return (
    <DashboardShell navItems={teacherNav} userName={tc("teacherName")} userSubtitle={tc("teacherTitle")}>
      <DashboardPageHeader title={t("reportsTitle")} subtitle={t("reportsSubtitle")} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card flex flex-col gap-2 p-5">
            <span className="text-2xl font-extrabold text-gold-dark">{s.value}</span>
            <span className="text-xs text-ink-soft">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
          <IconChart className="h-5 w-5 text-gold-dark" />
          {t("weeklySessionsChart")}
        </h3>
        <div className="flex flex-col gap-4">
          {WEEKLY_SESSIONS.map((w) => (
            <div key={w.week} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-xs text-ink-soft">{ts("weekLabel", { n: w.week })}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                <div
                  className="h-full rounded-pill bg-gold-gradient"
                  style={{ width: `${(w.sessions / maxSessions) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-end text-xs font-bold text-ink">{w.sessions} {tc("sessionsSuffix")}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
