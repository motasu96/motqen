"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { GroupWithMembers, joinGroup, leaveGroup, listAllGroupsForStudents, listMyGroupEnrollmentIds } from "@/lib/supabase/groups";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { useToast } from "@/components/Toast";
import { IconCalendar, IconCheck, IconClock, IconFamily } from "@/components/icons";

export default function StudentGroupsPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const { showToast } = useToast();
  const dayLabels = tc.raw("weekDaysSaturdayFirst") as string[];

  const [studentId, setStudentId] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

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
      const [allGroups, myEnrollments] = await Promise.all([
        listAllGroupsForStudents(supabase),
        listMyGroupEnrollmentIds(supabase, user.id),
      ]);
      if (cancelled) return;
      setStudentId(user.id);
      setGroups(allGroups);
      setEnrolledIds(myEnrollments);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleJoin(groupId: string) {
    if (!studentId) return;
    setActingOn(groupId);
    const ok = await joinGroup(createClient(), groupId, studentId);
    setActingOn(null);
    if (!ok) {
      showToast(t("errorGroupJoin"), "error");
      return;
    }
    setEnrolledIds((prev) => new Set(prev).add(groupId));
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, enrolledCount: g.enrolledCount + 1, enrolledNames: [...g.enrolledNames, studentName] } : g)));
    showToast(t("toastJoinedGroup"), "success");
  }

  async function handleLeave(groupId: string) {
    if (!studentId) return;
    setActingOn(groupId);
    const ok = await leaveGroup(createClient(), groupId, studentId);
    setActingOn(null);
    if (!ok) {
      showToast(t("errorGroupLeave"), "error");
      return;
    }
    setEnrolledIds((prev) => {
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, enrolledCount: Math.max(0, g.enrolledCount - 1) } : g)));
    showToast(t("toastLeftGroup"), "info");
  }

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("groupsTitle")} subtitle={t("groupsSubtitle")} />

      {!ready ? null : groups.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noGroupsYetStudent")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const program = programs.find((p) => p.slug === g.program_slug);
            const programTitle = program ? localize(program, locale).title : tc("dash");
            const title = locale === "en" && g.title_en ? g.title_en : g.title;
            const dayLabel = dayLabels[g.day_of_week] ?? "";
            const enrolled = enrolledIds.has(g.id);
            const spotsLeft = g.capacity - g.enrolledCount;
            const isFull = spotsLeft <= 0 && !enrolled;
            const busy = actingOn === g.id;

            return (
              <div key={g.id} className="card flex flex-col gap-4 p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
                    <IconFamily className="h-5 w-5 text-gold-dark" />
                  </span>
                  <div>
                    <span className="badge mb-1.5 w-fit">{programTitle}</span>
                    <h3 className="text-base font-extrabold leading-snug text-ink">{title}</h3>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-y border-line py-4 text-sm">
                  <div className="flex items-center gap-2 text-ink-soft">
                    <IconCalendar className="h-4 w-4 text-gold" />
                    {dayLabel} · {g.session_time}
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <IconClock className="h-4 w-4 text-gold" />
                    {tc("with")} {g.teacherName}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft">
                    {tc("enrolledLabel")}: {g.enrolledCount} / {g.capacity}
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
                        room={g.id}
                        displayName={studentName}
                        subject={title}
                        label={t("joinRoom")}
                        className="flex-1 justify-center"
                      />
                      <button
                        onClick={() => handleLeave(g.id)}
                        disabled={busy}
                        className="rounded-pill border border-line px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-bg hover:text-red-500 disabled:opacity-50"
                      >
                        {t("leaveGroup")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleJoin(g.id)} disabled={isFull || busy} className="btn-primary w-full disabled:opacity-50">
                    {t("joinGroup")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
