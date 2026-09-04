"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { teacherNav } from "@/components/dashboard/teacherNav";
import { teacherHomeworkReviews } from "@/data/dashboard";

export default function TeacherHomeworkPage() {
  return (
    <DashboardShell navItems={teacherNav} userName="أ. عبدالله السلمي" userSubtitle="معلم قرآن كريم">
      <DashboardPageHeader title="الواجبات" subtitle="راجع واجبات طلابك المُرسلة وقيّمها" />

      <div className="flex flex-col gap-4">
        {teacherHomeworkReviews.map((h) => (
          <div key={h.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-extrabold text-ink">{h.title}</div>
              <div className="text-xs text-ink-soft">{h.student} · أُرسل بتاريخ {h.submittedDate}</div>
            </div>
            <div className="flex items-center gap-3">
              {h.grade && (
                <span className="text-sm font-extrabold text-gold-dark">{h.grade}</span>
              )}
              {h.status === "بانتظار المراجعة" ? (
                <button className="btn-primary px-4 py-2 text-xs">مراجعة الآن</button>
              ) : (
                <span className="rounded-pill bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  تمت المراجعة
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
