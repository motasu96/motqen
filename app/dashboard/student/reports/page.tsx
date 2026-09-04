"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { studentNav } from "@/components/dashboard/studentNav";
import { IconChart } from "@/components/icons";

const STATS = [
  { label: "نسبة الحضور", value: 92 },
  { label: "إتمام الواجبات", value: 85 },
  { label: "معدل التقييم", value: 88 },
  { label: "نسبة الحفظ الكلي", value: 68 },
];

const WEEKLY = [
  { week: "الأسبوع 1", pages: 6 },
  { week: "الأسبوع 2", pages: 8 },
  { week: "الأسبوع 3", pages: 5 },
  { week: "الأسبوع 4", pages: 9 },
];

const maxPages = Math.max(...WEEKLY.map((w) => w.pages));

export default function StudentReportsPage() {
  return (
    <DashboardShell navItems={studentNav} userName="أحمد محمد" userSubtitle="طالب في برنامج الحفظ المتقن">
      <DashboardPageHeader title="التقارير" subtitle="نظرة عامة على أدائك خلال الشهر الحالي" />

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
          صفحات الحفظ الأسبوعية
        </h3>
        <div className="flex flex-col gap-4">
          {WEEKLY.map((w) => (
            <div key={w.week} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-xs text-ink-soft">{w.week}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                <div
                  className="h-full rounded-pill bg-gold-gradient"
                  style={{ width: `${(w.pages / maxPages) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-end text-xs font-bold text-ink">{w.pages} صفحات</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
