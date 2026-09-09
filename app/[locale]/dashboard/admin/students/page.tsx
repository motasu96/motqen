"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { adminStudents, AdminStudent } from "@/data/dashboard";
import { localize } from "@/lib/localize";

const STATUS_KEYS: Record<AdminStudent["status"], "personRegular" | "personLate" | "personStruggling"> = {
  منتظم: "personRegular",
  متأخر: "personLate",
  متعثر: "personStruggling",
};

const STATUS_STYLES: Record<AdminStudent["status"], string> = {
  منتظم: "bg-emerald-50 text-emerald-600",
  متأخر: "bg-gold-light text-gold-dark",
  متعثر: "bg-red-50 text-red-500",
};

export default function AdminStudentsPage() {
  const adminNav = useAdminNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={adminNav} userName={tc("adminName")} userSubtitle={tc("adminTitle")}>
      <DashboardPageHeader title={t("studentsTitle")} subtitle={t("studentsSubtitle")} />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("program")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("teacher")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("progress")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("joinDateLabel")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
              </tr>
            </thead>
            <tbody>
              {adminStudents.map((s0) => {
                const s = localize(s0, locale);
                return (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{s.name}</td>
                    <td className="px-6 py-4 text-ink-soft">{s.program}</td>
                    <td className="px-6 py-4 text-ink-soft">{s.teacher}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-pill bg-bg">
                          <div className="h-full rounded-pill bg-gold-gradient" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ink">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink-soft">{s.joinDate}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[s0.status]}`}>
                        {tStatus(STATUS_KEYS[s0.status])}
                      </span>
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
