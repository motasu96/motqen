"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { adminPrograms, AdminProgram } from "@/data/dashboard";
import { localize } from "@/lib/localize";

const STATUS_KEYS: Record<AdminProgram["status"], "published" | "draft"> = {
  منشور: "published",
  مسودة: "draft",
};

const STATUS_STYLES: Record<AdminProgram["status"], string> = {
  منشور: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  مسودة: "bg-gold-light text-gold-dark",
};

export default function AdminProgramsPage() {
  const adminNav = useAdminNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={adminNav} userName={tc("adminName")} userSubtitle={tc("adminTitle")}>
      <DashboardPageHeader title={t("programsTitle")} subtitle={t("programsSubtitle")} />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">{tc("program")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("enrolledCount")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("teachersCount")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("revenue")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("action")}</th>
              </tr>
            </thead>
            <tbody>
              {adminPrograms.map((p0) => {
                const p = localize(p0, locale);
                return (
                  <tr key={p.slug} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{p.title}</td>
                    <td className="px-6 py-4 text-ink-soft">{p.enrolled.toLocaleString("en-US")}</td>
                    <td className="px-6 py-4 text-ink-soft">{p.teachers}</td>
                    <td className="px-6 py-4 text-ink-soft">{p.monthlyRevenue.toLocaleString("en-US")} {tc("sar")}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[p0.status]}`}>
                        {tStatus(STATUS_KEYS[p0.status])}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-bold text-gold-dark hover:underline">{tc("viewDetails")}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
