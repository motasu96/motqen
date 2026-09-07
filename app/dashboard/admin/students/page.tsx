"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { adminNav } from "@/components/dashboard/adminNav";
import { adminStudents } from "@/data/dashboard";

const STATUS_STYLES: Record<(typeof adminStudents)[number]["status"], string> = {
  منتظم: "bg-emerald-50 text-emerald-600",
  متأخر: "bg-gold-light text-gold-dark",
  متعثر: "bg-red-50 text-red-500",
};

export default function AdminStudentsPage() {
  return (
    <DashboardShell navItems={adminNav} userName="أ. سلطان القرني" userSubtitle="مدير المشروع">
      <DashboardPageHeader title="الطلاب" subtitle="متابعة جميع طلاب المنصة وتقدمهم في البرامج" />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">الاسم</th>
                <th className="px-6 py-3 text-start font-bold">البرنامج</th>
                <th className="px-6 py-3 text-start font-bold">المعلم</th>
                <th className="px-6 py-3 text-start font-bold">نسبة التقدم</th>
                <th className="px-6 py-3 text-start font-bold">تاريخ الانضمام</th>
                <th className="px-6 py-3 text-start font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {adminStudents.map((s) => (
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
                    <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
