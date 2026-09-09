"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { archive } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconFolder } from "@/components/icons";

export default function StudentArchivePage() {
  const totalPages = archive.reduce((sum, a) => sum + a.pages, 0);
  const studentNav = useStudentNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")}>
      <DashboardPageHeader title={t("archiveTitle")} subtitle={t("archiveSubtitle")} />

      <div className="card mb-6 flex items-center gap-4 p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light">
          <IconFolder className="h-6 w-6 text-gold-dark" />
        </span>
        <div>
          <div className="text-xl font-extrabold text-gold-dark">{totalPages} {tc("pages")}</div>
          <div className="text-xs text-ink-soft">{t("archiveTotal")}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {archive.map((a0) => {
          const a = localize(a0, locale);
          return (
            <div key={a.id} className="card flex items-center justify-between p-5">
              <div>
                <div className="text-sm font-extrabold text-ink">{a.surah}</div>
                <div className="text-xs text-ink-soft">{a.juz} · {a.pages} {tc("pages")}</div>
              </div>
              <span className="text-xs font-bold text-ink-soft">{a.completedDate}</span>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
