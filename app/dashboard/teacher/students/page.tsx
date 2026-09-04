"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { teacherNav } from "@/components/dashboard/teacherNav";
import { teacherStudents } from "@/data/dashboard";

const STATUS_STYLES: Record<(typeof teacherStudents)[number]["status"], string> = {
  منتظم: "bg-emerald-50 text-emerald-600",
  متأخر: "bg-gold-light text-gold-dark",
  متعثر: "bg-red-50 text-red-500",
};

export default function TeacherStudentsPage() {
  return (
    <DashboardShell navItems={teacherNav} userName="أ. عبدالله السلمي" userSubtitle="معلم قرآن كريم">
      <DashboardPageHeader title="الطلاب" subtitle="جميع طلابك وحالة تقدمهم في برامجهم" />

      <div className="flex flex-col gap-4">
        {teacherStudents.map((s) => (
          <div key={s.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light text-sm font-extrabold text-gold-dark">
                {s.name[0]}
              </span>
              <div>
                <div className="text-sm font-extrabold text-ink">{s.name}</div>
                <div className="text-xs text-ink-soft">{s.program} · آخر حصة {s.lastSession}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden w-32 items-center gap-2 sm:flex">
                <div className="h-2 flex-1 overflow-hidden rounded-pill bg-bg">
                  <div className="h-full rounded-pill bg-gold-gradient" style={{ width: `${s.progress}%` }} />
                </div>
                <span className="text-xs font-bold text-ink-soft">{s.progress}%</span>
              </div>
              <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[s.status]}`}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
