"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { listNoticesForAudience, NoticeRow } from "@/lib/supabase/notices";
import { IconMegaphone } from "@/components/icons";

export default function TeacherNoticesPage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const t = useTranslations("Dashboard.teacher");

  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const rows = await listNoticesForAudience(supabase, "teachers");
      if (cancelled) return;
      setNotices(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("noticesTitle")} subtitle={t("noticesSubtitle")} />

      {!ready ? null : notices.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noNotices")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notices.map((n) => (
            <div key={n.id} className="card flex gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                <IconMegaphone className="h-5 w-5 text-gold-dark" />
              </span>
              <div>
                <div className="mb-1 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-extrabold text-ink">{n.title}</h3>
                  <span className="shrink-0 text-xs text-ink-soft">{n.created_at.slice(0, 10)}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
