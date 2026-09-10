"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { homework, HomeworkItem } from "@/data/dashboard";
import { localize } from "@/lib/localize";

const TYPE_KEYS: Record<HomeworkItem["type"], "typeRecitation" | "typeReview" | "typeTajweed"> = {
  تسميع: "typeRecitation",
  مراجعة: "typeReview",
  تجويد: "typeTajweed",
};

const STATUS_KEYS: Record<HomeworkItem["status"], "homeworkPending" | "homeworkSubmitted" | "homeworkGraded"> = {
  "بانتظار التسليم": "homeworkPending",
  "تم التسليم": "homeworkSubmitted",
  "تم التصحيح": "homeworkGraded",
};

const STATUS_STYLES: Record<HomeworkItem["status"], string> = {
  "بانتظار التسليم": "bg-gold-light text-gold-dark",
  "تم التسليم": "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  "تم التصحيح": "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
};

export default function StudentHomeworkPage() {
  const studentNav = useStudentNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")}>
      <DashboardPageHeader title={t("homeworkTitle")} subtitle={t("homeworkSubtitle")} />

      <div className="flex flex-col gap-4">
        {homework.map((h0) => {
          const h = localize(h0, locale);
          return (
            <div key={h.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="badge">{tStatus(TYPE_KEYS[h0.type])}</span>
                  <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[h0.status]}`}>
                    {tStatus(STATUS_KEYS[h0.status])}
                  </span>
                </div>
                <p className="text-sm font-bold text-ink">{h.title}</p>
                <p className="text-xs text-ink-soft">{tc("until")} {h.dueDate}</p>
              </div>
              {h.grade && (
                <div className="w-fit rounded-2xl border border-line bg-bg px-4 py-2 text-center">
                  <div className="text-xs text-ink-soft">{t("gradeLabel")}</div>
                  <div className="text-sm font-extrabold text-gold-dark">{h.grade}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
