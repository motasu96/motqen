"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { groupSessions } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { useGroupEnrollment } from "@/lib/useGroupEnrollment";
import { useToast } from "@/components/Toast";
import { IconCalendar, IconCheck, IconClock, IconFamily } from "@/components/icons";

const DAYS_ORDER = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function StudentGroupsPage() {
  const studentNav = useStudentNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const { ready, isEnrolled, join, leave } = useGroupEnrollment();
  const { showToast } = useToast();
  const dayLabels = tc.raw("weekDaysSaturdayFirst") as string[];

  function handleJoin(id: string) {
    join(id);
    showToast(t("toastJoinedGroup"), "success");
  }

  function handleLeave(id: string) {
    leave(id);
    showToast(t("toastLeftGroup"), "info");
  }

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")}>
      <DashboardPageHeader title={t("groupsTitle")} subtitle={t("groupsSubtitle")} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groupSessions.map((g0) => {
          const g = localize(g0, locale);
          const dayIndex = DAYS_ORDER.indexOf(g0.day);
          const dayLabel = dayLabels[dayIndex] ?? g0.day;
          const enrolled = ready && isEnrolled(g0.id);
          const effectiveCount = g0.enrolledStudents.length + (enrolled ? 1 : 0);
          const spotsLeft = g0.capacity - effectiveCount;
          const isFull = spotsLeft <= 0 && !enrolled;

          return (
            <div key={g0.id} className="card flex flex-col gap-4 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
                  <IconFamily className="h-5 w-5 text-gold-dark" />
                </span>
                <div>
                  <span className="badge mb-1.5 w-fit">{g.program}</span>
                  <h3 className="text-base font-extrabold leading-snug text-ink">{g.title}</h3>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-y border-line py-4 text-sm">
                <div className="flex items-center gap-2 text-ink-soft">
                  <IconCalendar className="h-4 w-4 text-gold" />
                  {dayLabel} · {g.time}
                </div>
                <div className="flex items-center gap-2 text-ink-soft">
                  <IconClock className="h-4 w-4 text-gold" />
                  {tc("with")} {g.teacher}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft">
                  {tc("enrolledLabel")}: {effectiveCount} / {g0.capacity}
                </span>
                {isFull ? (
                  <span className="rounded-pill bg-red-50 px-3 py-1 font-bold text-red-500 dark:bg-red-500/15 dark:text-red-400">
                    {tc("full")}
                  </span>
                ) : (
                  <span className="rounded-pill bg-gold-light px-3 py-1 font-bold text-gold-dark">
                    {tc("spotsLeft", { count: spotsLeft })}
                  </span>
                )}
              </div>

              {enrolled ? (
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <IconCheck className="h-3.5 w-3.5" />
                    {t("enrolledBadge")}
                  </span>
                  <div className="flex gap-2">
                    <JoinMeetingButton
                      room={g0.id}
                      displayName={tc("studentName")}
                      subject={g.title}
                      label={t("joinRoom")}
                      className="flex-1 justify-center"
                    />
                    <button
                      onClick={() => handleLeave(g0.id)}
                      className="rounded-pill border border-line px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-bg hover:text-red-500"
                    >
                      {t("leaveGroup")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleJoin(g0.id)}
                  disabled={isFull}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {t("joinGroup")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
