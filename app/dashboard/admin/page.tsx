"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/adminNav";
import { adminPrograms, adminStudents, adminTeachers, platformStats } from "@/data/dashboard";
import { IconChart, IconUsers } from "@/components/icons";

const pendingTeachers = adminTeachers.filter((t) => t.status === "قيد المراجعة");
const recentStudents = [...adminStudents]
  .sort((a, b) => (a.joinDate < b.joinDate ? 1 : -1))
  .slice(0, 5);

const STATUS_STYLES: Record<(typeof adminStudents)[number]["status"], string> = {
  منتظم: "bg-emerald-50 text-emerald-600",
  متأخر: "bg-gold-light text-gold-dark",
  متعثر: "bg-red-50 text-red-500",
};

const maxEnrolled = Math.max(...adminPrograms.map((p) => p.enrolled));

export default function AdminDashboardPage() {
  return (
    <DashboardShell navItems={adminNav} userName="أ. سلطان القرني" userSubtitle="مدير المشروع">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">لوحة تحكم المدير</h1>
          <p className="text-sm text-ink-soft">نظرة شاملة على أداء منصة متقن</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.label} className="card flex flex-col gap-2 p-5 sm:p-6">
              <span className="text-2xl font-extrabold text-ink">{s.value}</span>
              <span className="text-xs text-ink-soft">{s.label}</span>
              {s.delta && <span className="text-xs font-bold text-emerald-600">{s.delta}</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="card p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
              <IconChart className="h-5 w-5 text-gold-dark" />
              عدد المسجلين حسب البرنامج
            </h3>
            <div className="flex flex-col gap-4">
              {adminPrograms.map((p) => (
                <div key={p.slug} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 truncate text-xs text-ink-soft">{p.title}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                    <div
                      className="h-full rounded-pill bg-gold-gradient"
                      style={{ width: `${(p.enrolled / maxEnrolled) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-end text-xs font-bold text-ink">{p.enrolled}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-ink">
              <IconUsers className="h-5 w-5 text-gold-dark" />
              معلمون بانتظار المراجعة
            </h3>
            {pendingTeachers.length === 0 ? (
              <p className="text-sm text-ink-soft">لا توجد طلبات انضمام جديدة حاليًا.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {pendingTeachers.map((t) => (
                  <li key={t.id} className="rounded-2xl border border-line bg-bg p-4">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-sm font-extrabold text-ink">{t.name}</span>
                      <span className="text-xs text-ink-soft">{t.joinDate}</span>
                    </div>
                    <p className="mb-3 text-xs text-ink-soft">{t.specialty}</p>
                    <div className="flex gap-2">
                      <button className="rounded-pill bg-gold-gradient px-4 py-1.5 text-xs font-bold text-white">
                        قبول
                      </button>
                      <button className="rounded-pill border border-line px-4 py-1.5 text-xs font-bold text-ink-soft hover:bg-card">
                        رفض
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between p-6">
            <h3 className="text-base font-extrabold text-ink">أحدث الطلاب المسجلين</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-line bg-bg text-ink-soft">
                  <th className="px-6 py-3 text-start font-bold">الاسم</th>
                  <th className="px-6 py-3 text-start font-bold">البرنامج</th>
                  <th className="px-6 py-3 text-start font-bold">المعلم</th>
                  <th className="px-6 py-3 text-start font-bold">تاريخ الانضمام</th>
                  <th className="px-6 py-3 text-start font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{s.name}</td>
                    <td className="px-6 py-4 text-ink-soft">{s.program}</td>
                    <td className="px-6 py-4 text-ink-soft">{s.teacher}</td>
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
      </div>
    </DashboardShell>
  );
}
