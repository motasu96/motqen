"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useUpcomingBookings } from "@/lib/supabase/useUpcomingBookings";
import { createClient } from "@/lib/supabase/client";
import { listStudentLessons, LessonWithTeacher } from "@/lib/supabase/lessons";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { IconClock } from "@/components/icons";

export default function StudentLessonsPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const { upcoming, ready: upcomingReady } = useUpcomingBookings();

  const [pastLessons, setPastLessons] = useState<LessonWithTeacher[]>([]);
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
      const rows = await listStudentLessons(supabase, user.id);
      if (cancelled) return;
      setPastLessons(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")} onLogout={handleLogout}>
      <DashboardPageHeader title={t("lessonsTitle")} subtitle={t("lessonsSubtitle")} />

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="mb-3 text-sm font-extrabold text-ink">{t("upcomingSessionsTitle")}</h3>
          {!upcomingReady ? null : upcoming.length === 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-soft">{t("noUpcomingSessions")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((b) => (
                <div key={b.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                      <IconClock className="h-5 w-5 text-gold-dark" />
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-ink">{b.date}</div>
                      <div className="text-xs text-ink-soft">{tc("at")} {b.time} · {tc("with")} {b.teacherName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                      {tStatus("lessonUpcoming")}
                    </span>
                    <JoinMeetingButton room={b.id} displayName={tc("studentName")} subject={t("sessionSubject")} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-extrabold text-ink">{t("lessonsHistoryTitle")}</h3>
          {!ready ? null : pastLessons.length === 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-soft">{t("noLessonsHistory")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pastLessons.map((l) => (
                <div key={l.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                      <IconClock className="h-5 w-5 text-gold-dark" />
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-ink">{l.surah} — {l.ayah_range}</div>
                      <div className="text-xs text-ink-soft">{l.session_date} · {tc("with")} {l.teacherName}</div>
                      {l.notes && <div className="mt-1 text-xs text-ink-soft">{l.notes}</div>}
                    </div>
                  </div>
                  <span className="w-fit rounded-pill bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {tStatus("lessonCompleted")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
