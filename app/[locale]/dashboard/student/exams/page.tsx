"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { exams } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconExam } from "@/components/icons";

export default function StudentExamsPage() {
  const studentNav = useStudentNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")}>
      <DashboardPageHeader title={t("examsTitle")} subtitle={t("examsSubtitle")} />

      <div className="flex flex-col gap-4">
        {exams.map((e0) => {
          const e = localize(e0, locale);
          return (
            <div key={e.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                  <IconExam className="h-5 w-5 text-gold-dark" />
                </span>
                <div>
                  <div className="text-sm font-extrabold text-ink">{e.title}</div>
                  <div className="text-xs text-ink-soft">{e.date}</div>
                </div>
              </div>
              {e0.status === "قادم" ? (
                <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                  {tStatus("examUpcoming")}
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="rounded-pill bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {tStatus("examCompleted")}
                  </span>
                  <span className="text-sm font-extrabold text-ink">
                    {e.score} / {e.maxScore}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
