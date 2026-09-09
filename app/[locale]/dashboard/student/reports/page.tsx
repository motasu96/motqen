"use client";

import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { IconChart } from "@/components/icons";

const WEEKLY = [
  { week: 1, pages: 6 },
  { week: 2, pages: 8 },
  { week: 3, pages: 5 },
  { week: 4, pages: 9 },
];

const maxPages = Math.max(...WEEKLY.map((w) => w.pages));

export default function StudentReportsPage() {
  const studentNav = useStudentNav();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  const STATS = [
    { label: t("statAttendance"), value: 92 },
    { label: t("statHomeworkCompletion"), value: 85 },
    { label: t("statAvgGrade"), value: 88 },
    { label: t("statTotalMemorization"), value: 68 },
  ];

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")}>
      <DashboardPageHeader title={t("reportsTitle")} subtitle={t("reportsSubtitle")} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card flex flex-col gap-2 p-5">
            <span className="text-2xl font-extrabold text-gold-dark">{s.value}%</span>
            <span className="text-xs text-ink-soft">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
          <IconChart className="h-5 w-5 text-gold-dark" />
          {t("weeklyPagesChart")}
        </h3>
        <div className="flex flex-col gap-4">
          {WEEKLY.map((w) => (
            <div key={w.week} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-xs text-ink-soft">{t("weekLabel", { n: w.week })}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                <div
                  className="h-full rounded-pill bg-gold-gradient"
                  style={{ width: `${(w.pages / maxPages) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-end text-xs font-bold text-ink">{w.pages} {tc("pages")}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
