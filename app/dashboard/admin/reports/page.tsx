"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { adminNav } from "@/components/dashboard/adminNav";
import { adminStudents, adminTeachers } from "@/data/dashboard";
import { IconChart } from "@/components/icons";

const avgRating = (
  adminTeachers.reduce((sum, t) => sum + t.rating, 0) / adminTeachers.length
).toFixed(1);

const avgProgress = Math.round(
  adminStudents.reduce((sum, s) => sum + s.progress, 0) / adminStudents.length
);

const STATS = [
  { label: "متوسط تقييم المعلمين", value: `${avgRating} / 5` },
  { label: "متوسط تقدم الطلاب", value: `${avgProgress}%` },
  { label: "معدل الاحتفاظ بالطلاب", value: "91%" },
  { label: "اشتراكات جديدة هذا الشهر", value: "156" },
];

const MONTHLY_REVENUE = [
  { month: "أبريل", revenue: 345000 },
  { month: "مايو", revenue: 368000 },
  { month: "يونيو", revenue: 352000 },
  { month: "يوليو", revenue: 389000 },
  { month: "أغسطس", revenue: 412500 },
];

const maxRevenue = Math.max(...MONTHLY_REVENUE.map((m) => m.revenue));

export default function AdminReportsPage() {
  return (
    <DashboardShell navItems={adminNav} userName="أ. سلطان القرني" userSubtitle="مدير المشروع">
      <DashboardPageHeader title="التقارير" subtitle="نظرة عامة على أداء المنصة ونموها الشهري" />

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
          الإيرادات الشهرية
        </h3>
        <div className="flex flex-col gap-4">
          {MONTHLY_REVENUE.map((m) => (
            <div key={m.month} className="flex items-center gap-4">
              <span className="w-16 shrink-0 text-xs text-ink-soft">{m.month}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                <div
                  className="h-full rounded-pill bg-gold-gradient"
                  style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="w-28 shrink-0 text-end text-xs font-bold text-ink">
                {m.revenue.toLocaleString("en-US")} ر.س
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
