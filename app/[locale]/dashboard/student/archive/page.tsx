"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { listStudentMemorization, MemorizationRecordRow } from "@/lib/supabase/memorization";
import { IconFolder } from "@/components/icons";

export default function StudentArchivePage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  const [records, setRecords] = useState<MemorizationRecordRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setReady(true);
        return;
      }
      const rows = await listStudentMemorization(supabase, user.id);
      if (cancelled) return;
      setRecords(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = records.reduce((sum, r) => sum + r.pages, 0);

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("archiveTitle")} subtitle={t("archiveSubtitle")} />

      <div className="card mb-6 flex items-center gap-4 p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light">
          <IconFolder className="h-6 w-6 text-gold-dark" />
        </span>
        <div>
          <div className="text-xl font-extrabold text-gold-dark">{totalPages} {tc("pages")}</div>
          <div className="text-xs text-ink-soft">{t("archiveTotal")}</div>
        </div>
      </div>

      {!ready ? null : records.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noArchive")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {records.map((r) => (
            <div key={r.id} className="card flex items-center justify-between p-5">
              <div>
                <div className="text-sm font-extrabold text-ink">{r.title}</div>
                <div className="text-xs text-ink-soft">{r.pages} {tc("pages")}</div>
              </div>
              <span className="text-xs font-bold text-ink-soft">{r.completed_date}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
