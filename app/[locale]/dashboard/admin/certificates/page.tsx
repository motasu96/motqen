"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { useAdminProfile } from "@/lib/supabase/useAdminProfile";
import { createClient } from "@/lib/supabase/client";
import {
  CertificateRow,
  GRADE_LABELS,
  GRADE_LABEL_TRANSLATION_KEYS,
  GradeLabel,
  StudentForCertificate,
  deleteCertificate,
  issueCertificate,
  listAllCertificates,
  listStudentsForCertificates,
} from "@/lib/supabase/certificates";
import CertificateView from "@/components/CertificateView";
import { useToast } from "@/components/Toast";
import { IconAward, IconEye } from "@/components/icons";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminCertificatesPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const { name: adminName, title: adminTitle } = useAdminProfile();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tCert = useTranslations("Certificates");
  const { showToast } = useToast();

  const [adminId, setAdminId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentForCertificate[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [ready, setReady] = useState(false);
  const [viewing, setViewing] = useState<CertificateRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");
  const [achievement, setAchievement] = useState("");
  const [gradePercent, setGradePercent] = useState("");
  const [gradeLabel, setGradeLabel] = useState<GradeLabel | "">("");
  const [issuedAt, setIssuedAt] = useState(todayIso());
  const [issuing, setIssuing] = useState(false);

  async function load() {
    const supabase = createClient();
    const [studentRows, certRows] = await Promise.all([
      listStudentsForCertificates(supabase),
      listAllCertificates(supabase),
    ]);
    setStudents(studentRows);
    setCertificates(certRows);
    setReady(true);
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
      setAdminId(user.id);
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedStudent = students.find((s) => s.studentId === studentId) ?? null;

  async function handleIssue() {
    if (!adminId || !selectedStudent || !achievement.trim() || !issuedAt) {
      showToast(t("errorCertificateFields"), "error");
      return;
    }
    if (!selectedStudent.teacherId) {
      showToast(t("errorCertificateNoTeacher"), "error");
      return;
    }
    setIssuing(true);
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", adminId).single();
    const ok = await issueCertificate(supabase, {
      studentId: selectedStudent.studentId,
      studentName: selectedStudent.studentName,
      teacherId: selectedStudent.teacherId,
      teacherName: selectedStudent.teacherName,
      issuedBy: adminId,
      issuedByName: (profile?.full_name as string | null) || adminName,
      achievement: achievement.trim(),
      gradePercent: gradePercent.trim() ? Number(gradePercent) : null,
      gradeLabel: gradeLabel || null,
      issuedAt,
    });
    setIssuing(false);
    if (!ok) {
      showToast(t("errorCertificateSave"), "error");
      return;
    }
    showToast(t("toastCertificateIssued"), "success");
    setStudentId("");
    setAchievement("");
    setGradePercent("");
    setGradeLabel("");
    setIssuedAt(todayIso());
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDeleteCertificate"))) return;
    setDeletingId(id);
    const ok = await deleteCertificate(createClient(), id);
    setDeletingId(null);
    if (!ok) return;
    showToast(t("certificateDeleted"), "info");
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <DashboardShell navItems={adminNav} userName={adminName} userSubtitle={adminTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("certificatesTitle")} subtitle={t("certificatesSubtitle")} />

      {ready && (
        <div className="card mb-6 flex flex-col gap-4 p-6">
          <h3 className="text-sm font-extrabold text-ink">{t("issueCertificateTitle")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-ink-soft">{t("certFieldStudent")}</label>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input">
                <option value="">{t("selectStudentPlaceholder")}</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-ink-soft">{t("certFieldTeacher")}</label>
              <div className="input flex items-center text-ink-soft">{selectedStudent?.teacherName || tc("dash")}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-ink-soft">{t("certFieldAchievement")}</label>
            <input
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder={t("certAchievementPlaceholder")}
              className="input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-ink-soft">{t("certFieldGradePercent")}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={gradePercent}
                onChange={(e) => setGradePercent(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-ink-soft">{t("certFieldGradeLabel")}</label>
              <select value={gradeLabel} onChange={(e) => setGradeLabel(e.target.value as GradeLabel | "")} className="input">
                <option value="">{t("selectGradeLabelPlaceholder")}</option>
                {GRADE_LABELS.map((g) => (
                  <option key={g} value={g}>
                    {tCert(GRADE_LABEL_TRANSLATION_KEYS[g])}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-ink-soft">{t("certFieldDate")}</label>
              <input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} className="input" />
            </div>
          </div>

          <button onClick={handleIssue} disabled={issuing} className="btn-primary w-fit disabled:opacity-70">
            {issuing ? t("issuingCertificate") : t("issueCertificateCta")}
          </button>
        </div>
      )}

      <h3 className="mb-4 text-sm font-extrabold text-ink">{t("issuedCertificatesTitle")}</h3>
      {!ready ? null : certificates.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noCertificatesYet")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {certificates.map((c) => (
            <div key={c.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
                  <IconAward className="h-5 w-5 text-gold-dark" />
                </span>
                <div>
                  <div className="text-sm font-bold text-ink">{c.student_name}</div>
                  <div className="text-xs text-ink-soft">
                    {c.achievement}
                    {c.grade_label ? ` · ${tCert(GRADE_LABEL_TRANSLATION_KEYS[c.grade_label])}` : ""}
                    {c.grade_percent != null ? ` (${c.grade_percent}%)` : ""} · {tc("with")} {c.teacher_name} · {c.issued_at}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewing(c)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gold-dark hover:underline"
                >
                  <IconEye className="h-4 w-4" />
                  {tc("viewDetails")}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="text-xs font-bold text-ink-soft transition-colors hover:text-red-500 disabled:opacity-50"
                >
                  {tc("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && <CertificateView cert={viewing} onClose={() => setViewing(null)} />}
    </DashboardShell>
  );
}
