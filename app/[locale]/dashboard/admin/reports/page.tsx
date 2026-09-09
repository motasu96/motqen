"use client";

import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { adminStudents, adminTeachers } from "@/data/dashboard";
import { IconChart } from "@/components/icons";

const avgRating = (
  adminTeachers.reduce((sum, t) => sum + t.rating, 0) / adminTeachers.length
).toFixed(1);

const avgProgress = Math.round(
  adminStudents.reduce((sum, s) => sum + s.progress, 0) / adminStudents.length
);

const MONTHLY_REVENUE = [345000, 368000, 352000, 389000, 412500];
const maxRevenue = Math.max(...MONTHLY_REVENUE);

export default function AdminReportsPage() {
  const adminNav = useAdminNav();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const months = t.raw("months") as string[];

  const STATS = [
    { label: t("statAvgTeacherRating"), value: `${avgRating} / 5` },
    { label: t("statAvgStudentProgress"), value: `${avgProgress}%` },
    { label: t("statRetentionRate"), value: "91%" },
    { label: t("statNewSubsThisMonth"), value: "156" },
  ];

  return (
    <DashboardShell navItems={adminNav} userName={tc("adminName")} userSubtitle={tc("adminTitle")}>
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
          {t("monthlyRevenueChart")}
        </h3>
        <div className="flex flex-col gap-4">
          {MONTHLY_REVENUE.map((revenue, i) => (
            <div key={months[i]} className="flex items-center gap-4">
              <span className="w-16 shrink-0 text-xs text-ink-soft">{months[i]}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                <div
                  className="h-full rounded-pill bg-gold-gradient"
                  style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="w-28 shrink-0 text-end text-xs font-bold text-ink">
                {revenue.toLocaleString("en-US")} {tc("sar")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
