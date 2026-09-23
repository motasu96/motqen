"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId } from "@/lib/supabase/teacherStudents";
import {
  getTeacherOverviewStats,
  listTeacherRecentStudents,
  TeacherOverviewStats,
  TeacherRecentStudent,
} from "@/lib/supabase/teacherOverview";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import TeacherSessionsWidget from "@/components/dashboard/TeacherSessionsWidget";
import { IconCalendar, IconChart, IconFamily, IconTask, IconUsers, IconShield } from "@/components/icons";

const STATUS_KEYS: Record<TeacherRecentStudent["status"], "personRegular" | "personLate" | "personStruggling" | "personNew"> = {
  regular: "personRegular",
  late: "personLate",
  struggling: "personStruggling",
  new: "personNew",
};

const STATUS_STYLES: Record<TeacherRecentStudent["status"], string> = {
  regular: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  late: "bg-gold-light text-gold-dark",
  struggling: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
  new: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
};

export default function TeacherDashboardPage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [stats, setStats] = useState<TeacherOverviewStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<TeacherRecentStudent[]>([]);
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
      const [overviewStats, students] = await Promise.all([
        getTeacherOverviewStats(supabase, tId),
        listTeacherRecentStudents(supabase, tId),
      ]);
      if (cancelled) return;
      setTeacherId(tId);
      setStats(overviewStats);
      setRecentStudents(students);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const STATS = [
    { icon: IconUsers, value: stats ? stats.totalStudents.toLocaleString("en-US") : tc("dash"), label: t("statTotalStudents") },
    { icon: IconCalendar, value: stats ? stats.todaySessions.toLocaleString("en-US") : tc("dash"), label: t("statTodaySessions") },
    { icon: IconTask, value: stats ? stats.pendingHomework.toLocaleString("en-US") : tc("dash"), label: t("statPendingHomework") },
    { icon: IconChart, value: stats ? stats.completedSessions.toLocaleString("en-US") : tc("dash"), label: t("statCompletedSessions") },
  ];

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{t("dashboardTitle")}</h1>
          <p className="text-sm text-ink-soft">{t("dashboardSubtitle")}</p>
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

        {teacherId && (
          <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
                <IconShield className="h-5 w-5 text-gold-dark" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-ink">{t("directTitle")}</h3>
                <p className="text-sm text-ink-soft">{t("directDesc")}</p>
              </div>
            </div>
            <JoinMeetingButton
              room={`teacher-${teacherId}`}
              displayName={teacherName}
              subject={t("directSubject")}
              label={t("directCta")}
              lobby
              className="shrink-0 justify-center"
            />
          </div>
        )}

        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
              <IconFamily className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-ink">{t("groupsTeaserTitle")}</h3>
              <p className="text-sm text-ink-soft">{t("groupsTeaserDesc")}</p>
            </div>
          </div>
          <Link href="/dashboard/teacher/groups" className="btn-outline shrink-0 justify-center">
            {t("viewGroups")}
          </Link>
        </div>

        <TeacherSessionsWidget displayName={teacherName} />

        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between p-6">
            <h3 className="text-base font-extrabold text-ink">{t("studentsListTitle")}</h3>
          </div>
          {!ready ? null : recentStudents.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-ink-soft">{t("noStudentsYet")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-y border-line bg-bg text-ink-soft">
                    <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                    <th className="px-6 py-3 text-start font-bold">{tc("lastSession")}</th>
                    <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                    <th className="px-6 py-3 text-start font-bold">{tc("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((s) => (
                    <tr key={s.id} className="border-b border-line last:border-0">
                      <td className="px-6 py-4 font-bold text-ink">{s.name || tc("dash")}</td>
                      <td className="px-6 py-4 text-ink-soft">{s.lastSessionDate ?? tc("dash")}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[s.status]}`}>
                          {tStatus(STATUS_KEYS[s.status])}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href="/dashboard/teacher/students" className="text-xs font-bold text-gold-dark hover:underline">
                          {tc("viewProfile")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
