"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { getAttendanceStats } from "@/lib/supabase/lessons";
import { listStudentHomework } from "@/lib/supabase/homework";
import { listStudentMemorization } from "@/lib/supabase/memorization";
import { getMyStudentProfile } from "@/lib/supabase/students";
import { buildPlan, overallProgressPercent, weekIndexForDate } from "@/lib/quranPlan";
import { IconChart } from "@/components/icons";

const GRADE_RE = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/;

function weeksAgoBucket(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7) return 3;
  if (days < 14) return 2;
  if (days < 21) return 1;
  if (days < 28) return 0;
  return -1;
}

export default function StudentReportsPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");

  const [ready, setReady] = useState(false);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [homeworkPercent, setHomeworkPercent] = useState(0);
  const [avgGrade, setAvgGrade] = useState<number | null>(null);
  const [memorizationPercent, setMemorizationPercent] = useState(0);
  const [weeklyPages, setWeeklyPages] = useState<number[]>([0, 0, 0, 0]);

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

      const [attendance, homework, records, { student }] = await Promise.all([
        getAttendanceStats(supabase, user.id),
        listStudentHomework(supabase, user.id),
        listStudentMemorization(supabase, user.id),
        getMyStudentProfile(supabase, user.id),
      ]);
      if (cancelled) return;

      setAttendancePercent(attendance.percent);

      const doneHomework = homework.filter((h) => h.status !== "pending");
      setHomeworkPercent(homework.length > 0 ? Math.round((doneHomework.length / homework.length) * 100) : 0);

      const grades = homework
        .map((h) => (h.grade ? h.grade.match(GRADE_RE) : null))
        .filter((m): m is RegExpMatchArray => Boolean(m))
        .map((m) => (Number(m[1]) / Number(m[2])) * 100);
      setAvgGrade(grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null);

      if (student?.plan_duration_months) {
        const plan = buildPlan({
          durationMonths: student.plan_duration_months,
          alreadyMemorizedJuz: student.already_memorized_juz,
          reviewDaysPerWeek: (student.review_days_per_week === 2 ? 2 : 1) as 1 | 2,
          direction: student.plan_direction === "fromStart" ? "fromStart" : "fromEnd",
        });
        const weekIndex = weekIndexForDate(plan, new Date(student.created_at), new Date());
        setMemorizationPercent(overallProgressPercent(plan, weekIndex));
      }

      const buckets = [0, 0, 0, 0];
      for (const r of records) {
        const b = weeksAgoBucket(r.completed_date);
        if (b >= 0) buckets[b] += r.pages;
      }
      setWeeklyPages(buckets);

      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const STATS = [
    { label: t("statAttendance"), value: attendancePercent },
    { label: t("statHomeworkCompletion"), value: homeworkPercent },
    { label: t("statAvgGrade"), value: avgGrade ?? 0, hasValue: avgGrade !== null },
    { label: t("statTotalMemorization"), value: memorizationPercent },
  ];

  const maxPages = Math.max(1, ...weeklyPages);

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("reportsTitle")} subtitle={t("reportsSubtitle")} />

      {!ready ? null : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card flex flex-col gap-2 p-5">
                <span className="text-2xl font-extrabold text-gold-dark">
                  {s.hasValue === false ? tc("dash") : `${s.value}%`}
                </span>
                <span className="text-xs text-ink-soft">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
              <IconChart className="h-5 w-5 text-gold-dark" />
              {t("weeklyPagesChart")}
            </h3>
            <div className="flex flex-col gap-4">
              {weeklyPages.map((pages, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 text-xs text-ink-soft">{t("weekLabel", { n: i + 1 })}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-pill bg-bg">
                    <div className="h-full rounded-pill bg-gold-gradient" style={{ width: `${(pages / maxPages) * 100}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-end text-xs font-bold text-ink">{pages} {tc("pages")}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
