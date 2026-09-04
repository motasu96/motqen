"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { teacherNav } from "@/components/dashboard/teacherNav";
import { IconCalendar, IconChart, IconTask, IconUsers } from "@/components/icons";

const STATS = [
  { icon: IconUsers, value: "125", label: "إجمالي الطلاب" },
  { icon: IconCalendar, value: "4", label: "حصص اليوم" },
  { icon: IconTask, value: "18", label: "واجبات بانتظار المراجعة" },
  { icon: IconChart, value: "12", label: "حصص مكتملة" },
];

const STUDENTS = [
  { name: "أحمد محمد", lastSession: "2026-05-20", status: "منتظم" as const },
  { name: "عبدالرحمن خالد", lastSession: "2026-05-19", status: "متأخر" as const },
  { name: "يوسف باشا", lastSession: "2026-05-18", status: "منتظم" as const },
  { name: "محمد ياسر", lastSession: "2026-05-20", status: "متعثر" as const },
];

const STATUS_STYLES: Record<(typeof STUDENTS)[number]["status"], string> = {
  منتظم: "bg-emerald-50 text-emerald-600",
  متأخر: "bg-gold-light text-gold-dark",
  متعثر: "bg-red-50 text-red-500",
};

export default function TeacherDashboardPage() {
  return (
    <DashboardShell navItems={teacherNav} userName="أ. عبدالله السلمي" userSubtitle="معلم قرآن كريم">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">لوحة المعلم</h1>
          <p className="text-sm text-ink-soft">إدارة الطلاب ومتابعة تقدمهم</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="card flex flex-col gap-3 p-5 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-light">
                <s.icon className="h-5 w-5 text-gold-dark" />
              </span>
              <span className="text-2xl font-extrabold text-ink">{s.value}</span>
              <span className="text-xs text-ink-soft">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between p-6">
            <h3 className="text-base font-extrabold text-ink">قائمة الطلاب</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-line bg-bg text-ink-soft">
                  <th className="px-6 py-3 text-start font-bold">الاسم</th>
                  <th className="px-6 py-3 text-start font-bold">آخر حصة</th>
                  <th className="px-6 py-3 text-start font-bold">الحالة</th>
                  <th className="px-6 py-3 text-start font-bold">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {STUDENTS.map((s) => (
                  <tr key={s.name} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{s.name}</td>
                    <td className="px-6 py-4 text-ink-soft">{s.lastSession}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[s.status]}`}>
                        {s.status}
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
      </div>
    </DashboardShell>
  );
}
