"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { Link } from "@/i18n/navigation";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { createClient } from "@/lib/supabase/client";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { getEnrollmentByProgram } from "@/lib/supabase/adminOverview";

export default function AdminProgramsPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");

  const [enrollment, setEnrollment] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const counts = await getEnrollmentByProgram(supabase);
      if (cancelled) return;
      setEnrollment(counts);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={adminNav} userName={tc("adminName")} userSubtitle={tc("adminTitle")} onLogout={handleLogout}>
      <DashboardPageHeader title={t("programsTitle")} subtitle={t("programsSubtitle")} />

      {!ready ? null : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-y border-line bg-bg text-ink-soft">
                  <th className="px-6 py-3 text-start font-bold">{tc("program")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("enrolledCount")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("action")}</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p0) => {
                  const p = localize(p0, locale);
                  return (
                    <tr key={p.slug} className="border-b border-line last:border-0">
                      <td className="px-6 py-4 font-bold text-ink">{p.title}</td>
                      <td className="px-6 py-4 text-ink-soft">{(enrollment[p.slug] ?? 0).toLocaleString("en-US")}</td>
                      <td className="px-6 py-4">
                        <Link href={`/programs/${p.slug}`} target="_blank" className="text-xs font-bold text-gold-dark hover:underline">
                          {tc("viewDetails")}
                        </Link>
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
