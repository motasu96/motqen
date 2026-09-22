"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { useAdminProfile } from "@/lib/supabase/useAdminProfile";
import { createClient } from "@/lib/supabase/client";
import { AdminReportsData, getReportsData } from "@/lib/supabase/adminOverview";
import { IconChart } from "@/components/icons";

const MONTHS_BACK = 5;

function recentMonthNames(locale: string, count: number): string[] {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { month: "short" });
  const names: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    names.push(formatter.format(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  return names;
}

export default function AdminReportsPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const { name: adminName, title: adminTitle, updateName } = useAdminProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");

  const [data, setData] = useState<AdminReportsData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const reportsData = await getReportsData(supabase, MONTHS_BACK);
      if (cancelled) return;
      setData(reportsData);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const months = recentMonthNames(locale, MONTHS_BACK);
  const maxBookings = data ? Math.max(1, ...data.monthlyBookings) : 1;

  const STATS = [
    { label: t("statAvgTeacherRating"), value: data?.avgTeacherRating != null ? `${data.avgTeacherRating} / 5` : tc("dash") },
    { label: t("statAvgStudentProgress"), value: data?.avgStudentProgress != null ? `${data.avgStudentProgress}%` : tc("dash") },
    { label: t("statRetentionRate"), value: data?.retentionRatePercent != null ? `${data.retentionRatePercent}%` : tc("dash") },
    { label: t("statNewStudentsThisMonth"), value: data ? data.newStudentsThisMonth.toLocaleString("en-US") : tc("dash") },
  ];

  return (
    <DashboardShell navItems={adminNav} userName={adminName} userSubtitle={adminTitle} onLogout={handleLogout} onEditName={updateName}>
      <DashboardPageHeader title={t("reportsTitle")} subtitle={t("reportsSubtitle")} />

      {!ready ? null : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card flex flex-col gap-2 p-5">
                <span className="text-2xl font-extrabold text-gold-dark">{s.value}</span>
                <span className="text-xs text-ink-soft">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
              <IconChart className="h-5 w-5 text-gold-dark" />
              {t("monthlyBookingsChart")}
            </h3>
            <div className="flex flex-col gap-4">
              {(data?.monthlyBookings ?? []).map((count, i) => (
                <div key={months[i]} className="flex items-center gap-4">
                  <span className="w-16 shrink-0 text-xs text-ink-soft">{months[i]}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                    <div className="h-full rounded-pill bg-gold-gradient" style={{ width: `${(count / maxBookings) * 100}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-end text-xs font-bold text-ink">{count.toLocaleString("en-US")}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
