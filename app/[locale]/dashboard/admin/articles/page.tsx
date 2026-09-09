"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { adminArticles, AdminArticle } from "@/data/dashboard";
import { localize } from "@/lib/localize";

const STATUS_KEYS: Record<AdminArticle["status"], "published" | "draft"> = {
  منشور: "published",
  مسودة: "draft",
};

const STATUS_STYLES: Record<AdminArticle["status"], string> = {
  منشور: "bg-emerald-50 text-emerald-600",
  مسودة: "bg-gold-light text-gold-dark",
};

export default function AdminArticlesPage() {
  const adminNav = useAdminNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={adminNav} userName={tc("adminName")} userSubtitle={tc("adminTitle")}>
      <DashboardPageHeader title={t("articlesTitle")} subtitle={t("articlesSubtitle")} />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">{tc("title")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("author")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("views")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("publishDate")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("action")}</th>
              </tr>
            </thead>
            <tbody>
              {adminArticles.map((a0) => {
                const a = localize(a0, locale);
                return (
                  <tr key={a.slug} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{a.title}</td>
                    <td className="px-6 py-4 text-ink-soft">{a.author}</td>
                    <td className="px-6 py-4 text-ink-soft">{a.views.toLocaleString("en-US")}</td>
                    <td className="px-6 py-4 text-ink-soft">{a.date}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[a0.status]}`}>
                        {tStatus(STATUS_KEYS[a0.status])}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-bold text-gold-dark hover:underline">{tc("edit")}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
