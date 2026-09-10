"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { teacherHomeworkReviews } from "@/data/dashboard";
import { localize } from "@/lib/localize";

export default function TeacherHomeworkPage() {
  const teacherNav = useTeacherNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={teacherNav} userName={tc("teacherName")} userSubtitle={tc("teacherTitle")}>
      <DashboardPageHeader title={t("homeworkTitle")} subtitle={t("homeworkSubtitle")} />

      <div className="flex flex-col gap-4">
        {teacherHomeworkReviews.map((h0) => {
          const h = localize(h0, locale);
          return (
            <div key={h.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold text-ink">{h.title}</div>
                <div className="text-xs text-ink-soft">{h.student} · {t("submittedOn", { date: h.submittedDate })}</div>
              </div>
              <div className="flex items-center gap-3">
                {h.grade && (
                  <span className="text-sm font-extrabold text-gold-dark">{h.grade}</span>
                )}
                {h0.status === "بانتظار المراجعة" ? (
                  <button className="btn-primary px-4 py-2 text-xs">{tc("reviewNow")}</button>
                ) : (
                  <span className="rounded-pill bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {tStatus("reviewDone")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
