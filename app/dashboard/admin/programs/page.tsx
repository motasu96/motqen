"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { adminNav } from "@/components/dashboard/adminNav";
import { adminPrograms } from "@/data/dashboard";

const STATUS_STYLES: Record<(typeof adminPrograms)[number]["status"], string> = {
  منشور: "bg-emerald-50 text-emerald-600",
  مسودة: "bg-gold-light text-gold-dark",
};

export default function AdminProgramsPage() {
  return (
    <DashboardShell navItems={adminNav} userName="أ. سلطان القرني" userSubtitle="مدير المشروع">
      <DashboardPageHeader title="البرامج" subtitle="إدارة برامج المنصة التعليمية ومتابعة إيراداتها" />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">البرنامج</th>
                <th className="px-6 py-3 text-start font-bold">عدد المسجلين</th>
                <th className="px-6 py-3 text-start font-bold">عدد المعلمين</th>
                <th className="px-6 py-3 text-start font-bold">الإيراد الشهري</th>
                <th className="px-6 py-3 text-start font-bold">الحالة</th>
                <th className="px-6 py-3 text-start font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {adminPrograms.map((p) => (
                <tr key={p.slug} className="border-b border-line last:border-0">
                  <td className="px-6 py-4 font-bold text-ink">{p.title}</td>
                  <td className="px-6 py-4 text-ink-soft">{p.enrolled.toLocaleString("en-US")}</td>
                  <td className="px-6 py-4 text-ink-soft">{p.teachers}</td>
                  <td className="px-6 py-4 text-ink-soft">{p.monthlyRevenue.toLocaleString("en-US")} ر.س</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-bold text-gold-dark hover:underline">عرض التفاصيل</button>
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
