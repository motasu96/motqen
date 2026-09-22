"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { useAdminProfile } from "@/lib/supabase/useAdminProfile";
import { createClient } from "@/lib/supabase/client";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { IconChart, IconUsers } from "@/components/icons";
import { useToast } from "@/components/Toast";
import {
  AdminOverviewStats,
  AdminRecentStudent,
  getAdminOverviewStats,
  getEnrollmentByProgram,
  listRecentStudents,
} from "@/lib/supabase/adminOverview";
import {
  approveApplication,
  listPendingApplications,
  rejectApplication,
  TeacherApplication,
} from "@/lib/supabase/teacherApplications";

const STATUS_KEYS: Record<AdminRecentStudent["status"], "personRegular" | "personLate" | "personStruggling"> = {
  regular: "personRegular",
  late: "personLate",
  struggling: "personStruggling",
};

const STATUS_STYLES: Record<AdminRecentStudent["status"], string> = {
  regular: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  late: "bg-gold-light text-gold-dark",
  struggling: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
};

export default function AdminDashboardPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const { name: adminName, title: adminTitle, updateName } = useAdminProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const { showToast } = useToast();

  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [enrollment, setEnrollment] = useState<Record<string, number>>({});
  const [pendingApps, setPendingApps] = useState<TeacherApplication[]>([]);
  const [recentStudents, setRecentStudents] = useState<AdminRecentStudent[]>([]);
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function loadData() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    const [overviewStats, enrollmentCounts, applications, students] = await Promise.all([
      getAdminOverviewStats(supabase),
      getEnrollmentByProgram(supabase),
      listPendingApplications(supabase),
      listRecentStudents(supabase, 5),
    ]);
    setStats(overviewStats);
    setEnrollment(enrollmentCounts);
    setPendingApps(applications);
    setRecentStudents(students);
    setReady(true);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function approve(app: TeacherApplication) {
    setActingOn(app.id);
    const ok = await approveApplication(createClient(), app);
    if (ok) {
      showToast(t("applicationApproved"), "success");
      await loadData();
    }
    setActingOn(null);
  }

  async function reject(app: TeacherApplication) {
    setActingOn(app.id);
    const ok = await rejectApplication(createClient(), app);
    if (ok) {
      showToast(t("applicationRejected"), "success");
      await loadData();
    }
    setActingOn(null);
  }

  const activeProgramsCount = programs.length;
  const enrollmentEntries = programs
    .map((p) => ({ program: localize(p, locale), count: enrollment[p.slug] ?? 0 }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxEnrolled = Math.max(1, ...enrollmentEntries.map((e) => e.count));

  const STAT_CARDS = stats
    ? [
        { label: t("statTotalStudents"), value: stats.totalStudents.value, delta: stats.totalStudents.deltaPercent },
        { label: t("statTotalTeachers"), value: stats.totalTeachers.value, delta: stats.totalTeachers.deltaPercent },
        { label: t("statActivePrograms"), value: activeProgramsCount, delta: null },
        { label: t("statMonthlyBookings"), value: stats.monthlyBookings.value, delta: stats.monthlyBookings.deltaPercent },
      ]
    : [];

  return (
    <DashboardShell navItems={adminNav} userName={adminName} userSubtitle={adminTitle} onLogout={handleLogout} onEditName={updateName}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{t("dashboardTitle")}</h1>
          <p className="text-sm text-ink-soft">{t("dashboardSubtitle")}</p>
        </div>

        {!ready ? null : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {STAT_CARDS.map((s) => (
                <div key={s.label} className="card flex flex-col gap-2 p-5 sm:p-6">
                  <span className="text-2xl font-extrabold text-ink">{s.value.toLocaleString(locale === "en" ? "en-US" : "ar-EG")}</span>
                  <span className="text-xs text-ink-soft">{s.label}</span>
                  {s.delta !== null && (
                    <span className={`text-xs font-bold ${s.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                      {t("deltaFromLastMonth", { percent: s.delta >= 0 ? `+${s.delta}` : s.delta })}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="card p-6">
                <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
                  <IconChart className="h-5 w-5 text-gold-dark" />
                  {t("enrollmentByProgram")}
                </h3>
                {enrollmentEntries.length === 0 ? (
                  <p className="text-sm text-ink-soft">{t("noEnrollmentYet")}</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {enrollmentEntries.map((e) => (
                      <div key={e.program.slug} className="flex items-center gap-4">
                        <span className="w-32 shrink-0 truncate text-xs text-ink-soft">{e.program.title}</span>
                        <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                          <div className="h-full rounded-pill bg-gold-gradient" style={{ width: `${(e.count / maxEnrolled) * 100}%` }} />
                        </div>
                        <span className="w-14 shrink-0 text-end text-xs font-bold text-ink">{e.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-ink">
                  <IconUsers className="h-5 w-5 text-gold-dark" />
                  {t("pendingTeachers")}
                </h3>
                {pendingApps.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light">
                      <IconUsers className="h-4 w-4 text-gold-dark" />
                    </span>
                    <p className="text-sm text-ink-soft">{t("noPendingTeachers")}</p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {pendingApps.map((app) => (
                      <li key={app.id} className="rounded-2xl border border-line bg-bg p-4">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <span className="text-sm font-extrabold text-ink">{app.full_name}</span>
                          <span className="text-xs text-ink-soft">{app.created_at.slice(0, 10)}</span>
                        </div>
                        <p className="mb-3 text-xs text-ink-soft">{app.specialties.join("، ") || "—"}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approve(app)}
                            disabled={actingOn === app.id}
                            className="rounded-pill bg-gold-gradient px-4 py-1.5 text-xs font-bold text-white disabled:opacity-70"
                          >
                            {tc("accept")}
                          </button>
                          <button
                            onClick={() => reject(app)}
                            disabled={actingOn === app.id}
                            className="rounded-pill border border-line px-4 py-1.5 text-xs font-bold text-ink-soft hover:bg-card disabled:opacity-70"
                          >
                            {tc("reject")}
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
                <h3 className="text-base font-extrabold text-ink">{t("recentStudents")}</h3>
              </div>
              {recentStudents.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-ink-soft">{t("noRecentStudents")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-y border-line bg-bg text-ink-soft">
                        <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                        <th className="px-6 py-3 text-start font-bold">{tc("program")}</th>
                        <th className="px-6 py-3 text-start font-bold">{tc("teacher")}</th>
                        <th className="px-6 py-3 text-start font-bold">{tc("joinDateLabel")}</th>
                        <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentStudents.map((s) => {
                        const program = programs.find((p) => p.slug === s.programSlug);
                        const programTitle = program ? localize(program, locale).title : tc("dash");
                        return (
                          <tr key={s.id} className="border-b border-line last:border-0">
                            <td className="px-6 py-4 font-bold text-ink">{s.name || tc("dash")}</td>
                            <td className="px-6 py-4 text-ink-soft">{programTitle}</td>
                            <td className="px-6 py-4 text-ink-soft">{s.teacherName || tc("dash")}</td>
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
              )}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
