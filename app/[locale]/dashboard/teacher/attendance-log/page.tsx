"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId } from "@/lib/supabase/teacherStudents";
import { GroupWithMembers, listTeacherGroups } from "@/lib/supabase/groups";
import { GroupAttendanceRow, listGroupAttendanceHistory } from "@/lib/supabase/groupAttendance";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { IconCheck, IconFamily, IconPencil, IconX } from "@/components/icons";

export default function TeacherAttendanceLogPage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");

  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [historyByGroup, setHistoryByGroup] = useState<Map<string, GroupAttendanceRow[]>>(new Map());
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
      const rows = await listTeacherGroups(supabase, tId);
      if (cancelled) return;
      setGroups(rows);
      const histories = await Promise.all(rows.map((g) => listGroupAttendanceHistory(supabase, g.id)));
      if (cancelled) return;
      setHistoryByGroup(new Map(rows.map((g, i) => [g.id, histories[i]])));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("attendanceLogTitle")} subtitle={t("attendanceLogSubtitle")} />

      {!ready ? null : groups.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noGroupsYetTeacher")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => {
            const program = programs.find((p) => p.slug === g.program_slug);
            const programTitle = program ? localize(program, locale).title : tc("dash");
            const title = locale === "en" && g.title_en ? g.title_en : g.title;
            const history = historyByGroup.get(g.id) ?? [];
            const historyByStudent = new Map<string, GroupAttendanceRow[]>();
            for (const row of history) {
              const list = historyByStudent.get(row.student_id) ?? [];
              list.push(row);
              historyByStudent.set(row.student_id, list);
            }

            return (
              <div key={g.id} className="card flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
                    <IconFamily className="h-5 w-5 text-gold-dark" />
                  </span>
                  <div>
                    <span className="badge w-fit">{programTitle}</span>
                    <h3 className="text-base font-extrabold leading-snug text-ink">{title}</h3>
                  </div>
                </div>

                {g.enrolledMembers.length === 0 ? (
                  <p className="text-sm text-ink-soft">{t("noMembersForAttendance")}</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {g.enrolledMembers.map((m) => {
                      const entries = historyByStudent.get(m.id) ?? [];
                      const attendedCount = entries.filter((e) => e.attended).length;
                      return (
                        <div key={m.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-bg p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-ink">{m.name}</span>
                            {entries.length > 0 && (
                              <span className="shrink-0 rounded-pill bg-gold-light px-2.5 py-0.5 text-[11px] font-bold text-gold-dark">
                                {attendedCount}/{entries.length}
                              </span>
                            )}
                          </div>
                          {entries.length === 0 ? (
                            <p className="text-xs text-ink-soft">{t("noAttendanceHistoryForStudent")}</p>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {entries.map((entry) => (
                                <Link
                                  key={entry.id}
                                  href={`/dashboard/teacher/groups?openLog=${g.id}&date=${entry.session_date}`}
                                  className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card px-2.5 py-1.5 text-xs transition-colors hover:border-gold/60"
                                >
                                  <span className="flex items-center gap-1.5 font-bold text-ink">
                                    {entry.attended ? (
                                      <IconCheck className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />
                                    ) : (
                                      <IconX className="h-3 w-3 shrink-0 text-red-500" aria-hidden="true" />
                                    )}
                                    {entry.session_date}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-ink-soft">
                                    {entry.grade && <span className="font-bold text-gold-dark">{entry.grade}</span>}
                                    <IconPencil className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
