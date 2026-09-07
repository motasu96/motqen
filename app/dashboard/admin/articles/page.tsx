"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { adminNav } from "@/components/dashboard/adminNav";
import { adminArticles } from "@/data/dashboard";

const STATUS_STYLES: Record<(typeof adminArticles)[number]["status"], string> = {
  منشور: "bg-emerald-50 text-emerald-600",
  مسودة: "bg-gold-light text-gold-dark",
};

export default function AdminArticlesPage() {
  return (
    <DashboardShell navItems={adminNav} userName="أ. سلطان القرني" userSubtitle="مدير المشروع">
      <DashboardPageHeader title="المقالات" subtitle="إدارة محتوى المدونة ومتابعة حالة النشر" />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">العنوان</th>
                <th className="px-6 py-3 text-start font-bold">الكاتب</th>
                <th className="px-6 py-3 text-start font-bold">المشاهدات</th>
                <th className="px-6 py-3 text-start font-bold">تاريخ النشر</th>
                <th className="px-6 py-3 text-start font-bold">الحالة</th>
                <th className="px-6 py-3 text-start font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {adminArticles.map((a) => (
                <tr key={a.slug} className="border-b border-line last:border-0">
                  <td className="px-6 py-4 font-bold text-ink">{a.title}</td>
                  <td className="px-6 py-4 text-ink-soft">{a.author}</td>
                  <td className="px-6 py-4 text-ink-soft">{a.views.toLocaleString("en-US")}</td>
                  <td className="px-6 py-4 text-ink-soft">{a.date}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-bold text-gold-dark hover:underline">تعديل</button>
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
