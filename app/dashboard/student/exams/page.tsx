"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { studentNav } from "@/components/dashboard/studentNav";
import { exams } from "@/data/dashboard";
import { IconExam } from "@/components/icons";

export default function StudentExamsPage() {
  return (
    <DashboardShell navItems={studentNav} userName="أحمد محمد" userSubtitle="طالب في برنامج الحفظ المتقن">
      <DashboardPageHeader title="الاختبارات" subtitle="اختباراتك القادمة والسابقة ونتائجها" />

      <div className="flex flex-col gap-4">
        {exams.map((e) => (
          <div key={e.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                <IconExam className="h-5 w-5 text-gold-dark" />
              </span>
              <div>
                <div className="text-sm font-extrabold text-ink">{e.title}</div>
                <div className="text-xs text-ink-soft">{e.date}</div>
              </div>
            </div>
            {e.status === "قادم" ? (
              <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                قادم
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="rounded-pill bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  مكتمل
                </span>
                <span className="text-sm font-extrabold text-ink">
                  {e.score} / {e.maxScore}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
