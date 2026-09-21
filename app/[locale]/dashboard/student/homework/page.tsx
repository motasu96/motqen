"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { HomeworkRow, HomeworkType, listStudentHomework, markHomeworkSubmitted } from "@/lib/supabase/homework";
import { useToast } from "@/components/Toast";

const TYPE_KEYS: Record<HomeworkType, "typeRecitation" | "typeReview" | "typeTajweed"> = {
  recitation: "typeRecitation",
  review: "typeReview",
  tajweed: "typeTajweed",
};

const STATUS_KEYS: Record<HomeworkRow["status"], "homeworkPending" | "homeworkSubmitted" | "homeworkGraded"> = {
  pending: "homeworkPending",
  submitted: "homeworkSubmitted",
  graded: "homeworkGraded",
};

const STATUS_STYLES: Record<HomeworkRow["status"], string> = {
  pending: "bg-gold-light text-gold-dark",
  submitted: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  graded: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
};

export default function StudentHomeworkPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const { showToast } = useToast();

  const [items, setItems] = useState<HomeworkRow[]>([]);
  const [ready, setReady] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

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
      const rows = await listStudentHomework(supabase, user.id);
      if (cancelled) return;
      setItems(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(id: string) {
    setSubmittingId(id);
    const ok = await markHomeworkSubmitted(createClient(), id);
    setSubmittingId(null);
    if (!ok) return;
    setItems((prev) => prev.map((h) => (h.id === id ? { ...h, status: "submitted" as const } : h)));
    showToast(t("toastHomeworkSubmitted"), "success");
  }

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("homeworkTitle")} subtitle={t("homeworkSubtitle")} />

      {!ready ? null : items.length === 0 ? (
        <div className="card flex items-center gap-3 p-6">
          <p className="text-sm text-ink-soft">{t("noHomework")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((h) => (
            <div key={h.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="badge">{tStatus(TYPE_KEYS[h.type])}</span>
                  <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[h.status]}`}>
                    {tStatus(STATUS_KEYS[h.status])}
                  </span>
                </div>
                <p className="text-sm font-bold text-ink">{h.title}</p>
                <p className="text-xs text-ink-soft">{tc("until")} {h.due_date}</p>
              </div>
              <div className="flex items-center gap-3">
                {h.grade && (
                  <div className="w-fit rounded-2xl border border-line bg-bg px-4 py-2 text-center">
                    <div className="text-xs text-ink-soft">{t("gradeLabel")}</div>
                    <div className="text-sm font-extrabold text-gold-dark">{h.grade}</div>
                  </div>
                )}
                {h.status === "pending" && (
                  <button
                    onClick={() => handleSubmit(h.id)}
                    disabled={submittingId === h.id}
                    className="btn-primary px-4 py-2 text-xs disabled:opacity-70"
                  >
                    {t("markSubmittedCta")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
