"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useStudentNav } from "@/components/dashboard/studentNav";
import MyUpcomingSessions from "@/components/dashboard/MyUpcomingSessions";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { useUpcomingBookings } from "@/lib/supabase/useUpcomingBookings";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { createClient } from "@/lib/supabase/client";
import { getMyStudentProfile, StudentRow } from "@/lib/supabase/students";
import { getLatestLesson, LessonWithTeacher } from "@/lib/supabase/lessons";
import { HomeworkRow, HomeworkType, listStudentHomework } from "@/lib/supabase/homework";
import { todayPortion } from "@/data/dashboard";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { IconTask, IconTrophy, IconShield, IconFamily, IconBook, IconInbox } from "@/components/icons";
import {
  buildPlan,
  weekIndexForDate,
  getWeekPlan,
  overallProgressPercent,
  SurahPosition,
  PlanDirection,
} from "@/lib/quranPlan";
import { getSurahByNumber } from "@/data/quranSurahs";

const TYPE_KEYS: Record<HomeworkType, "typeRecitation" | "typeReview" | "typeTajweed"> = {
  recitation: "typeRecitation",
  review: "typeReview",
  tajweed: "typeTajweed",
};

type DashboardCache = {
  fullName: string | null;
  studentRow: StudentRow | null;
  latestLesson: LessonWithTeacher | null;
  recentHomework: HomeworkRow[];
};

const CACHE_KEY = "motqen_student_dashboard_cache";

function readDashboardCache(): DashboardCache | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDashboardCache(data: DashboardCache) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" className="stroke-line" strokeWidth="9" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        className="stroke-gold"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90 fill-ink"
        style={{ transform: "rotate(90deg)", transformOrigin: "50px 50px", fontSize: "18px", fontWeight: 800 }}
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function StudentDashboardPage() {
  const { upcoming, ready: bookingsReady, cancel: cancelBooking } = useUpcomingBookings();
  const nextLesson = upcoming[0];
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const tPlan = useTranslations("Signup");
  const portion = localize(todayPortion, locale);

  const cached = typeof window !== "undefined" ? readDashboardCache() : null;
  const [fullName, setFullName] = useState<string | null>(cached?.fullName ?? null);
  const [studentRow, setStudentRow] = useState<StudentRow | null>(cached?.studentRow ?? null);
  const [latestLesson, setLatestLesson] = useState<LessonWithTeacher | null>(cached?.latestLesson ?? null);
  const [recentHomework, setRecentHomework] = useState<HomeworkRow[]>(cached?.recentHomework ?? []);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const [{ fullName: name, student }, lesson, hw] = await Promise.all([
        getMyStudentProfile(supabase, user.id),
        getLatestLesson(supabase, user.id),
        listStudentHomework(supabase, user.id),
      ]);
      if (cancelled) return;
      const recent = hw.filter((h) => h.status !== "graded").slice(0, 2);
      setFullName(name);
      setStudentRow(student);
      setLatestLesson(lesson);
      setRecentHomework(recent);
      writeDashboardCache({ fullName: name, studentRow: student, latestLesson: lesson, recentHomework: recent });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentName = fullName || tc("studentName");
  const studentProgram = studentRow?.program_slug ? programs.find((p) => p.slug === studentRow.program_slug) : undefined;
  const studentTitle = studentProgram ? localize(studentProgram, locale).title : tc("studentTitle");

  const planData = useMemo(() => {
    if (!studentRow?.plan_duration_months) return null;
    const plan = buildPlan({
      durationMonths: studentRow.plan_duration_months,
      alreadyMemorizedJuz: studentRow.already_memorized_juz,
      reviewDaysPerWeek: (studentRow.review_days_per_week === 2 ? 2 : 1) as 1 | 2,
      direction: studentRow.plan_direction === "fromStart" ? "fromStart" : ("fromEnd" as PlanDirection),
    });
    const weekIndex = weekIndexForDate(plan, new Date(studentRow.created_at), new Date());
    const currentWeek = weekIndex ? getWeekPlan(plan, weekIndex) : undefined;
    const percent = overallProgressPercent(plan, weekIndex);
    return { plan, weekIndex, currentWeek, percent };
  }, [studentRow]);

  function formatSurahPosition(pos: SurahPosition) {
    const surah = getSurahByNumber(pos.surahNumber);
    const surahName = surah ? (locale === "en" ? surah.nameEn : surah.nameAr) : "";
    return `${surahName} — ${tPlan("planAyahLabel", { n: pos.ayahInSurah })}`;
  }

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{t("greeting", { name: studentName })}</h1>
          <p className="text-sm text-ink-soft">{t("homeSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card flex flex-col items-center gap-3 p-6 text-center">
            <span className="text-sm font-bold text-ink-soft">{t("memorizationProgress")}</span>
            <ProgressRing percent={planData ? planData.percent : 68} />
            <span className="text-xs text-ink-soft">{t("progressEncouragement")}</span>
          </div>

          <div className="card flex flex-col gap-3 p-6">
            <span className="text-sm font-bold text-ink-soft">{t("lastLesson")}</span>
            {latestLesson ? (
              <>
                <h3 className="text-lg font-extrabold text-ink">{latestLesson.surah}</h3>
                <p className="text-xs text-ink-soft">{latestLesson.ayah_range}</p>
                <span className="mt-auto w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                  {tc("with")} {latestLesson.teacherName}
                </span>
              </>
            ) : (
              <p className="mt-auto text-sm text-ink-soft">{t("noLastLesson")}</p>
            )}
          </div>

          <div className="card flex flex-col gap-3 p-6">
            <span className="text-sm font-bold text-ink-soft">{t("nextSession")}</span>
            {nextLesson ? (
              <>
                <h3 className="text-lg font-extrabold text-ink">{nextLesson.date}</h3>
                <p className="text-xs text-ink-soft">{tc("at")} {nextLesson.time}</p>
                <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                  {tc("with")} {nextLesson.teacherName}
                </span>
                <JoinMeetingButton
                  room={nextLesson.id}
                  displayName={studentName}
                  subject={t("sessionSubject")}
                  className="mt-auto w-full justify-center"
                />
              </>
            ) : (
              <p className="text-sm text-ink-soft">{t("noUpcoming")}</p>
            )}
          </div>
        </div>

        <div className="card flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
              <IconBook className="h-5 w-5 text-gold-dark" />
              {t("todayPortionTitle")}
            </h3>
          </div>
          {planData ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-line bg-bg p-4">
              {planData.weekIndex ? (
                <>
                  <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                    {t("planWeekOf", { current: planData.weekIndex, total: planData.plan.totalWeeks })}
                  </span>
                  <h4 className="text-lg font-extrabold text-ink">{t("planWeekTargetLabel")}</h4>
                  {planData.currentWeek && (
                    <p className="text-sm text-ink-soft">
                      {formatSurahPosition(planData.currentWeek.fromPosition)} {tPlan("planRangeSeparator")}{" "}
                      {formatSurahPosition(planData.currentWeek.toPosition)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-bold text-ink">{t("planCompleted")}</p>
              )}
            </div>
          ) : portion.hasPortion ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-line bg-bg p-4">
              <h4 className="text-lg font-extrabold text-ink">{portion.surah}</h4>
              <p className="text-sm text-ink-soft">{portion.range}</p>
              <p className="text-xs text-ink-soft">{portion.note}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light">
                <IconInbox className="h-4 w-4 text-gold-dark" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{t("todayPortionEmptyTitle")}</p>
                <p className="text-xs text-ink-soft">{t("todayPortionEmptyDesc")}</p>
              </div>
            </div>
          )}
        </div>

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
            room="teacher-abdullah-alsalmi"
            displayName={studentName}
            subject={t("directSubject")}
            label={t("directCta")}
            className="shrink-0 justify-center"
          />
        </div>

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
          <Link href="/dashboard/student/groups" className="btn-outline shrink-0 justify-center">
            {t("browseGroups")}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <MyUpcomingSessions upcoming={upcoming} ready={bookingsReady} onCancel={cancelBooking} displayName={studentName} />

          <div className="flex flex-col gap-6">
            <div className="card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-ink">
                <IconTask className="h-5 w-5 text-gold-dark" />
                {t("myHomework")}
              </h3>
              {recentHomework.length === 0 ? (
                <p className="text-sm text-ink-soft">{t("noHomework")}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {recentHomework.map((h) => (
                    <li key={h.id} className="rounded-2xl border border-line bg-bg p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="badge">{tStatus(TYPE_KEYS[h.type])}</span>
                        <span className="text-xs text-ink-soft">{tc("until")} {h.due_date}</span>
                      </div>
                      <p className="text-sm font-bold text-ink">{h.title}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card flex flex-col items-center gap-3 p-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
                <IconTrophy className="h-7 w-7 text-gold-dark" />
              </span>
              <p className="text-sm font-bold text-ink">{t("badgesCta")}</p>
              <span className="text-xs text-ink-soft">{t("badgesCount")}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
