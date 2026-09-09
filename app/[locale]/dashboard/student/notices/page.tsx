"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { studentNotices } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconMegaphone } from "@/components/icons";

export default function StudentNoticesPage() {
  const studentNav = useStudentNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")}>
      <DashboardPageHeader title={t("noticesTitle")} subtitle={t("noticesSubtitle")} />

      <div className="flex flex-col gap-4">
        {studentNotices.map((n0) => {
          const n = localize(n0, locale);
          return (
            <div key={n.id} className="card flex gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                <IconMegaphone className="h-5 w-5 text-gold-dark" />
              </span>
              <div>
                <div className="mb-1 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-extrabold text-ink">{n.title}</h3>
                  <span className="shrink-0 text-xs text-ink-soft">{n.date}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{n.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
