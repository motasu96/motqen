"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId, listTeacherStudents, TeacherStudentOption } from "@/lib/supabase/teacherStudents";
import { createExam, ExamRow, listStudentExams, recordExamScore } from "@/lib/supabase/exams";
import { confirmMemorization } from "@/lib/supabase/memorization";
import { useToast } from "@/components/Toast";
import { IconExam, IconFolder } from "@/components/icons";

function ExamScoreForm({ exam, onRecorded }: { exam: ExamRow; onRecorded: (id: string, score: number, maxScore: number) => void }) {
  const t = useTranslations("Dashboard.teacher");
  const { showToast } = useToast();
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [saving, setSaving] = useState(false);

  async function handleRecord() {
    const s = Number(score);
    const m = Number(maxScore);
    if (!score || !maxScore || s < 0 || m <= 0) {
      showToast(t("errorScoreFields"), "error");
      return;
    }
    setSaving(true);
    const ok = await recordExamScore(createClient(), exam.id, s, m);
    setSaving(false);
    if (!ok) {
      showToast(t("errorScoreSave"), "error");
      return;
    }
    showToast(t("toastScoreRecorded"), "success");
    onRecorded(exam.id, s, m);
  }

  return (
    <div className="flex items-center gap-2">
      <input value={score} onChange={(e) => setScore(e.target.value)} type="number" min={0} className="input w-16 py-1.5 text-xs" />
      <span className="text-xs text-ink-soft">/</span>
      <input value={maxScore} onChange={(e) => setMaxScore(e.target.value)} type="number" min={1} className="input w-16 py-1.5 text-xs" />
      <button onClick={handleRecord} disabled={saving} className="btn-primary px-3 py-1.5 text-xs disabled:opacity-70">
        {t("recordScoreCta")}
      </button>
    </div>
  );
}

function StudentActionsRow({ student, teacherId }: { student: TeacherStudentOption; teacherId: string }) {
  const t = useTranslations("Dashboard.teacher");
  const tStatus = useTranslations("Dashboard.status");
  const { showToast } = useToast();
  const [openPanel, setOpenPanel] = useState<"exam" | "memorization" | null>(null);
  const [studentExams, setStudentExams] = useState<ExamRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await listStudentExams(createClient(), student.id);
      if (!cancelled) setStudentExams(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [student.id]);

  function handleScoreRecorded(id: string, score: number, maxScore: number) {
    setStudentExams((prev) => prev.map((e) => (e.id === id ? { ...e, status: "completed", score, max_score: maxScore } : e)));
  }

  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [savingExam, setSavingExam] = useState(false);

  const [memTitle, setMemTitle] = useState("");
  const [memPages, setMemPages] = useState("");
  const [memDate, setMemDate] = useState("");
  const [savingMem, setSavingMem] = useState(false);

  async function handleCreateExam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) {
      showToast(t("errorExamFields"), "error");
      return;
    }
    setSavingExam(true);
    const ok = await createExam(createClient(), {
      studentId: student.id,
      teacherId,
      title: examTitle.trim(),
      examDate,
    });
    setSavingExam(false);
    if (!ok) {
      showToast(t("errorExamSave"), "error");
      return;
    }
    setExamTitle("");
    setExamDate("");
    setOpenPanel(null);
    showToast(t("toastExamCreated"), "success");
    const rows = await listStudentExams(createClient(), student.id);
    setStudentExams(rows);
  }

  async function handleConfirmMemorization(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pages = Number(memPages);
    if (!memTitle.trim() || !memDate || !pages || pages <= 0) {
      showToast(t("errorMemorizationFields"), "error");
      return;
    }
    setSavingMem(true);
    const ok = await confirmMemorization(createClient(), {
      studentId: student.id,
      teacherId,
      title: memTitle.trim(),
      pages,
      completedDate: memDate,
    });
    setSavingMem(false);
    if (!ok) {
      showToast(t("errorMemorizationSave"), "error");
      return;
    }
    setMemTitle("");
    setMemPages("");
    setMemDate("");
    setOpenPanel(null);
    showToast(t("toastMemorizationConfirmed"), "success");
  }

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light text-sm font-extrabold text-gold-dark">
            {student.name ? student.name[0] : "?"}
          </span>
          <div className="text-sm font-extrabold text-ink">{student.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenPanel(openPanel === "exam" ? null : "exam")}
            className="btn-outline flex items-center gap-2 px-4 py-2 text-xs"
          >
            <IconExam className="h-4 w-4" />
            {t("newExamCta")}
          </button>
          <button
            onClick={() => setOpenPanel(openPanel === "memorization" ? null : "memorization")}
            className="btn-outline flex items-center gap-2 px-4 py-2 text-xs"
          >
            <IconFolder className="h-4 w-4" />
            {t("confirmMemorizationCta")}
          </button>
        </div>
      </div>

      {openPanel === "exam" && (
        <form onSubmit={handleCreateExam} className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4 sm:flex-row sm:items-end">
          <input
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder={t("examTitlePlaceholder")}
            className="input flex-1 py-2 text-xs"
          />
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="input py-2 text-xs" />
          <button type="submit" disabled={savingExam} className="btn-primary px-4 py-2 text-xs disabled:opacity-70">
            {savingExam ? t("saving") : t("createExamCta")}
          </button>
        </form>
      )}

      {openPanel === "memorization" && (
        <form
          onSubmit={handleConfirmMemorization}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4 sm:flex-row sm:items-end"
        >
          <input
            value={memTitle}
            onChange={(e) => setMemTitle(e.target.value)}
            placeholder={t("memorizationTitlePlaceholder")}
            className="input flex-1 py-2 text-xs"
          />
          <input
            type="number"
            min={1}
            value={memPages}
            onChange={(e) => setMemPages(e.target.value)}
            placeholder={t("memorizationPagesPlaceholder")}
            className="input w-24 py-2 text-xs"
          />
          <input type="date" value={memDate} onChange={(e) => setMemDate(e.target.value)} className="input py-2 text-xs" />
          <button type="submit" disabled={savingMem} className="btn-primary px-4 py-2 text-xs disabled:opacity-70">
            {savingMem ? t("saving") : t("confirmCta")}
          </button>
        </form>
      )}

      {studentExams.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-line pt-3">
          {studentExams.map((exam) => (
            <div key={exam.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-ink">{exam.title} — {exam.exam_date}</span>
              {exam.status === "completed" ? (
                <span className="rounded-pill bg-emerald-50 px-3 py-1 font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  {tStatus("examCompleted")}: {exam.score} / {exam.max_score}
                </span>
              ) : (
                <ExamScoreForm exam={exam} onRecorded={handleScoreRecorded} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeacherStudentsPage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const t = useTranslations("Dashboard.teacher");

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [students, setStudents] = useState<TeacherStudentOption[]>([]);
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
      const rows = await listTeacherStudents(supabase, tId);
      if (cancelled) return;
      setTeacherId(tId);
      setStudents(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("studentsTitle")} subtitle={t("studentsSubtitle")} />

      {!ready ? null : students.length === 0 || !teacherId ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noStudentsYet")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {students.map((s) => (
            <StudentActionsRow key={s.id} student={s} teacherId={teacherId} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
