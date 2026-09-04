"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { studentNav } from "@/components/dashboard/studentNav";
import { homework } from "@/data/dashboard";

const STATUS_STYLES: Record<(typeof homework)[number]["status"], string> = {
  "بانتظار التسليم": "bg-gold-light text-gold-dark",
  "تم التسليم": "bg-sky-50 text-sky-600",
  "تم التصحيح": "bg-emerald-50 text-emerald-600",
};

export default function StudentHomeworkPage() {
  return (
    <DashboardShell navItems={studentNav} userName="أحمد محمد" userSubtitle="طالب في برنامج الحفظ المتقن">
      <DashboardPageHeader title="واجباتي" subtitle="تابع واجباتك وحالتها وتقييم معلمك لها" />

      <div className="flex flex-col gap-4">
        {homework.map((h) => (
          <div key={h.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="badge">{h.type}</span>
                <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[h.status]}`}>
                  {h.status}
                </span>
              </div>
              <p className="text-sm font-bold text-ink">{h.title}</p>
              <p className="text-xs text-ink-soft">حتى {h.dueDate}</p>
            </div>
            {h.grade && (
              <div className="w-fit rounded-2xl border border-line bg-bg px-4 py-2 text-center">
                <div className="text-xs text-ink-soft">التقييم</div>
                <div className="text-sm font-extrabold text-gold-dark">{h.grade}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
