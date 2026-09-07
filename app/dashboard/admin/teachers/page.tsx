"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { adminNav } from "@/components/dashboard/adminNav";
import { adminTeachers } from "@/data/dashboard";
import { IconStar } from "@/components/icons";

const STATUS_STYLES: Record<(typeof adminTeachers)[number]["status"], string> = {
  نشط: "bg-emerald-50 text-emerald-600",
  "قيد المراجعة": "bg-gold-light text-gold-dark",
  موقوف: "bg-red-50 text-red-500",
};

export default function AdminTeachersPage() {
  return (
    <DashboardShell navItems={adminNav} userName="أ. سلطان القرني" userSubtitle="مدير المشروع">
      <DashboardPageHeader title="المعلمون" subtitle="إدارة معلمي ومعلمات المنصة ومتابعة أدائهم" />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">الاسم</th>
                <th className="px-6 py-3 text-start font-bold">التخصص</th>
                <th className="px-6 py-3 text-start font-bold">عدد الطلاب</th>
                <th className="px-6 py-3 text-start font-bold">التقييم</th>
                <th className="px-6 py-3 text-start font-bold">تاريخ الانضمام</th>
                <th className="px-6 py-3 text-start font-bold">الحالة</th>
                <th className="px-6 py-3 text-start font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {adminTeachers.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4 font-bold text-ink">{t.name}</td>
                  <td className="px-6 py-4 text-ink-soft">{t.specialty}</td>
                  <td className="px-6 py-4 text-ink-soft">{t.students.toLocaleString("en-US")}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 font-bold text-ink">
                      <IconStar className="h-3.5 w-3.5 text-gold-dark" />
                      {t.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink-soft">{t.joinDate}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-bold text-gold-dark hover:underline">عرض الملف</button>
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
