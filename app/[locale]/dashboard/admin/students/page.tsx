"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { useAdminProfile } from "@/lib/supabase/useAdminProfile";
import { createClient } from "@/lib/supabase/client";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { AdminRecentStudent, listAllStudents } from "@/lib/supabase/adminOverview";

const STATUS_KEYS: Record<AdminRecentStudent["status"], "personRegular" | "personLate" | "personStruggling" | "personNew"> = {
  regular: "personRegular",
  late: "personLate",
  struggling: "personStruggling",
  new: "personNew",
};

const STATUS_STYLES: Record<AdminRecentStudent["status"], string> = {
  regular: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  late: "bg-gold-light text-gold-dark",
  struggling: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
  new: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
};

export default function AdminStudentsPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const { name: adminName, title: adminTitle, updateName } = useAdminProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  const [students, setStudents] = useState<AdminRecentStudent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const rows = await listAllStudents(supabase);
      if (cancelled) return;
      setStudents(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={adminNav} userName={adminName} userSubtitle={adminTitle} onLogout={handleLogout} onEditName={updateName}>
      <DashboardPageHeader title={t("studentsTitle")} subtitle={t("studentsSubtitle")} />

      {!ready ? null : students.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noRecentStudents")}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-y border-line bg-bg text-ink-soft">
                  <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("program")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("teacher")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("progress")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("joinDateLabel")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const program = programs.find((p) => p.slug === s.programSlug);
                  const programTitle = program ? localize(program, locale).title : tc("dash");
                  return (
                    <tr key={s.id} className="border-b border-line last:border-0">
                      <td className="px-6 py-4 font-bold text-ink">{s.name || tc("dash")}</td>
                      <td className="px-6 py-4 text-ink-soft">{programTitle}</td>
                      <td className="px-6 py-4 text-ink-soft">{s.teacherName || tc("dash")}</td>
                      <td className="px-6 py-4">
                        {s.progressPercent === null ? (
                          <span className="text-ink-soft">{tc("dash")}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-pill bg-bg">
                              <div className="h-full rounded-pill bg-gold-gradient" style={{ width: `${s.progressPercent}%` }} />
                            </div>
                            <span className="text-xs font-bold text-ink">{s.progressPercent}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-ink-soft">{s.joinDate.slice(0, 10)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[s.status]}`}>
                          {tStatus(STATUS_KEYS[s.status])}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
