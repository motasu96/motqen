"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { teacherNav } from "@/components/dashboard/teacherNav";
import { teacherStudents } from "@/data/dashboard";
import { IconChart } from "@/components/icons";

const avgProgress = Math.round(
  teacherStudents.reduce((sum, s) => sum + s.progress, 0) / teacherStudents.length
);

const STATS = [
  { label: "متوسط تقدم الطلاب", value: `${avgProgress}%` },
  { label: "نسبة الحضور الشهرية", value: "94%" },
  { label: "تقييم الطلاب", value: "4.9 / 5" },
  { label: "حصص مكتملة هذا الشهر", value: "46" },
];

const WEEKLY_SESSIONS = [
  { week: "الأسبوع 1", sessions: 10 },
  { week: "الأسبوع 2", sessions: 12 },
  { week: "الأسبوع 3", sessions: 9 },
  { week: "الأسبوع 4", sessions: 15 },
];

const maxSessions = Math.max(...WEEKLY_SESSIONS.map((w) => w.sessions));

export default function TeacherReportsPage() {
  return (
    <DashboardShell navItems={teacherNav} userName="أ. عبدالله السلمي" userSubtitle="معلم قرآن كريم">
      <DashboardPageHeader title="التقارير" subtitle="نظرة عامة على أدائك وأداء طلابك هذا الشهر" />

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
          الحصص المكتملة أسبوعيًا
        </h3>
        <div className="flex flex-col gap-4">
          {WEEKLY_SESSIONS.map((w) => (
            <div key={w.week} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-xs text-ink-soft">{w.week}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                <div
                  className="h-full rounded-pill bg-gold-gradient"
                  style={{ width: `${(w.sessions / maxSessions) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-end text-xs font-bold text-ink">{w.sessions} حصص</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
