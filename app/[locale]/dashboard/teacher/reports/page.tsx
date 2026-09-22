"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId } from "@/lib/supabase/teacherStudents";
import { getTeacherReportsData, TeacherReportsData } from "@/lib/supabase/teacherOverview";
import { IconChart } from "@/components/icons";

const WEEKS_BACK = 4;

export default function TeacherReportsPage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const t = useTranslations("Dashboard.teacher");
  const ts = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  const [data, setData] = useState<TeacherReportsData | null>(null);
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
      const tId = await getMyTeacherId(supabase, user.id);
      if (!tId || cancelled) {
        setReady(true);
        return;
      }
      const reportsData = await getTeacherReportsData(supabase, tId, WEEKS_BACK);
      if (cancelled) return;
      setData(reportsData);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxSessions = data ? Math.max(1, ...data.weeklySessions) : 1;

  const STATS = [
    { label: t("statAvgProgress"), value: data?.avgStudentProgress != null ? `${data.avgStudentProgress}%` : tc("dash") },
    { label: t("statMonthlyAttendance"), value: data?.attendanceRatePercent != null ? `${data.attendanceRatePercent}%` : tc("dash") },
    { label: t("statStudentRating"), value: data?.rating != null ? `${data.rating} / 5` : tc("dash") },
    { label: t("statCompletedThisMonth"), value: data ? data.completedThisMonth.toLocaleString("en-US") : tc("dash") },
  ];

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
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
              {t("weeklySessionsChart")}
            </h3>
            <div className="flex flex-col gap-4">
              {(data?.weeklySessions ?? []).map((sessions, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 text-xs text-ink-soft">{ts("weekLabel", { n: i + 1 })}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                    <div className="h-full rounded-pill bg-gold-gradient" style={{ width: `${(sessions / maxSessions) * 100}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-end text-xs font-bold text-ink">
                    {sessions} {tc("sessionsSuffix")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
