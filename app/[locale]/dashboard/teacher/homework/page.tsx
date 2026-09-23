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
import {
  assignHomework,
  gradeHomework,
  HomeworkType,
  HomeworkWithStudent,
  listTeacherHomework,
} from "@/lib/supabase/homework";
import { useToast } from "@/components/Toast";

const TYPE_KEYS: Record<HomeworkType, "typeRecitation" | "typeReview" | "typeTajweed"> = {
  recitation: "typeRecitation",
  review: "typeReview",
  tajweed: "typeTajweed",
};

const STATUS_KEYS: Record<HomeworkWithStudent["status"], "homeworkPending" | "homeworkSubmitted" | "homeworkGraded"> = {
  pending: "homeworkPending",
  submitted: "homeworkSubmitted",
  graded: "homeworkGraded",
};

export default function TeacherHomeworkPage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const { showToast } = useToast();

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [students, setStudents] = useState<TeacherStudentOption[]>([]);
  const [items, setItems] = useState<HomeworkWithStudent[]>([]);
  const [ready, setReady] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HomeworkType>("recitation");
  const [dueDate, setDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState("");

  function startGrading(h: HomeworkWithStudent) {
    setGradingId(h.id);
    setGradeValue(h.grade ?? "");
  }

  async function load(tId: string) {
    const supabase = createClient();
    const [studentRows, hwRows] = await Promise.all([
      listTeacherStudents(supabase, tId),
      listTeacherHomework(supabase, tId),
    ]);
    setStudents(studentRows);
    setItems(hwRows);
  }

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
      setTeacherId(tId);
      await load(tId);
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAssign(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teacherId || !studentId || !title.trim() || !dueDate) {
      showToast(t("errorAssignFields"), "error");
      return;
    }
    setAssigning(true);
    const ok = await assignHomework(createClient(), { studentId, teacherId, title: title.trim(), type, dueDate });
    setAssigning(false);
    if (!ok) {
      showToast(t("errorAssignSave"), "error");
      return;
    }
    setTitle("");
    setDueDate("");
    showToast(t("toastHomeworkAssigned"), "success");
    await load(teacherId);
  }

  async function handleGrade(id: string) {
    if (!gradeValue.trim()) return;
    const ok = await gradeHomework(createClient(), id, gradeValue.trim());
    if (!ok) return;
    setItems((prev) => prev.map((h) => (h.id === id ? { ...h, status: "graded", grade: gradeValue.trim() } : h)));
    setGradingId(null);
    setGradeValue("");
    showToast(t("toastHomeworkGraded"), "success");
  }

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("homeworkTitle")} subtitle={t("homeworkSubtitle")} />

      {!ready ? null : (
        <div className="flex flex-col gap-6">
          {students.length > 0 && (
            <form onSubmit={handleAssign} className="card flex flex-col gap-4 p-6">
              <h3 className="text-base font-extrabold text-ink">{t("assignHomeworkTitle")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input">
                  <option value="">{t("selectStudentPlaceholder")}</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select value={type} onChange={(e) => setType(e.target.value as HomeworkType)} className="input">
                  <option value="recitation">{tStatus("typeRecitation")}</option>
                  <option value="review">{tStatus("typeReview")}</option>
                  <option value="tajweed">{tStatus("typeTajweed")}</option>
                </select>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("homeworkTitlePlaceholder")}
                className="input"
              />
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input max-w-[200px]" />
              <button type="submit" disabled={assigning} className="btn-primary w-fit px-5 disabled:opacity-70">
                {assigning ? t("assigning") : t("assignHomeworkCta")}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-4">
            {items.length === 0 ? (
              <div className="card p-6">
                <p className="text-sm text-ink-soft">{t("noAssignedHomework")}</p>
              </div>
            ) : (
              items.map((h) => (
                <div key={h.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="badge">{tStatus(TYPE_KEYS[h.type])}</span>
                      <span className="rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                        {tStatus(STATUS_KEYS[h.status])}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-ink">{h.title}</p>
                    <p className="text-xs text-ink-soft">{h.studentName} · {tc("until")} {h.due_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {gradingId === h.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                          placeholder={t("gradePlaceholder")}
                          className="input w-28 py-2 text-xs"
                        />
                        <button onClick={() => handleGrade(h.id)} className="btn-primary px-3 py-2 text-xs">
                          {tc("accept")}
                        </button>
                        <button onClick={() => setGradingId(null)} className="text-xs font-bold text-ink-soft hover:text-gold-dark">
                          {tc("cancel")}
                        </button>
                      </div>
                    ) : (
                      <>
                        {h.grade && <span className="text-sm font-extrabold text-gold-dark">{h.grade}</span>}
                        {h.status === "submitted" ? (
                          <button onClick={() => startGrading(h)} className="btn-primary px-4 py-2 text-xs">
                            {tc("reviewNow")}
                          </button>
                        ) : h.status === "graded" ? (
                          <button
                            onClick={() => startGrading(h)}
                            className="text-xs font-bold text-ink-soft transition-colors hover:text-gold-dark"
                          >
                            {tc("edit")}
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
