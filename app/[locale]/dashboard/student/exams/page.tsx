"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { ExamRow, listStudentExams } from "@/lib/supabase/exams";
import { IconExam } from "@/components/icons";

export default function StudentExamsPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const t = useTranslations("Dashboard.student");
  const tStatus = useTranslations("Dashboard.status");

  const [exams, setExams] = useState<ExamRow[]>([]);
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
      const rows = await listStudentExams(supabase, user.id);
      if (cancelled) return;
      setExams(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("examsTitle")} subtitle={t("examsSubtitle")} />

      {!ready ? null : exams.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noExams")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {exams.map((e) => (
            <div key={e.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                  <IconExam className="h-5 w-5 text-gold-dark" />
                </span>
                <div>
                  <div className="text-sm font-extrabold text-ink">{e.title}</div>
                  <div className="text-xs text-ink-soft">{e.exam_date}</div>
                </div>
              </div>
              {e.status === "upcoming" ? (
                <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                  {tStatus("examUpcoming")}
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="rounded-pill bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {tStatus("examCompleted")}
                  </span>
                  <span className="text-sm font-extrabold text-ink">
                    {e.score} / {e.max_score}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
