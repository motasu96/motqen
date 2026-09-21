"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { createClient } from "@/lib/supabase/client";
import { generateUniqueSlug, TeacherRow } from "@/lib/supabase/teachers";
import { useToast } from "@/components/Toast";
import { IconStar, IconX } from "@/components/icons";

type TeacherApplication = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  gender: "male" | "female";
  specialties: string[];
  years_experience: number | null;
  ijazah: string | null;
  bio: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  photo_url: string | null;
  certificate_path: string | null;
};

type EditForm = {
  name: string;
  name_en: string;
  title: string;
  title_en: string;
  bio: string;
  bio_en: string;
  specialties: string;
  specialties_en: string;
  years_experience: string;
  students_count: string;
  completed_sessions: string;
  rating: string;
  status: "active" | "suspended";
};

function toEditForm(row: TeacherRow): EditForm {
  return {
    name: row.name,
    name_en: row.name_en ?? "",
    title: row.title ?? "",
    title_en: row.title_en ?? "",
    bio: row.bio ?? "",
    bio_en: row.bio_en ?? "",
    specialties: row.specialties.join("، "),
    specialties_en: row.specialties_en.join(", "),
    years_experience: String(row.years_experience),
    students_count: String(row.students_count),
    completed_sessions: String(row.completed_sessions),
    rating: String(row.rating),
    status: row.status,
  };
}

export default function AdminTeachersPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const { showToast } = useToast();

  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const supabase = createClient();
    const [{ data: apps }, { data: teacherRows }] = await Promise.all([
      supabase.from("teacher_applications").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("teachers").select("*").order("created_at", { ascending: false }),
    ]);
    setApplications((apps as TeacherApplication[]) ?? []);
    setTeachers((teacherRows as TeacherRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function approve(app: TeacherApplication) {
    setActingOn(app.id);
    const supabase = createClient();
    const slug = await generateUniqueSlug(supabase, app.full_name);

    const { data: inserted, error: insertError } = await supabase
      .from("teachers")
      .insert({
        slug,
        name: app.full_name,
        gender: app.gender,
        specialties: app.specialties,
        years_experience: app.years_experience ?? 0,
        bio: app.bio,
        avatar_url: app.photo_url,
        application_id: app.id,
        status: "active",
      })
      .select("id")
      .single();

    if (!insertError && inserted) {
      await supabase
        .from("teacher_applications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", app.id);
      fetch("/api/teacher-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherRowId: inserted.id, name: app.full_name, email: app.email, phone: app.phone, slug }),
      }).catch(() => {});
      showToast(t("applicationApproved"), "success");
      await loadData();
    }
    setActingOn(null);
  }

  async function viewCertificate(app: TeacherApplication) {
    if (!app.certificate_path) return;
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("teacher-certificates")
      .createSignedUrl(app.certificate_path, 60 * 5);
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function reject(app: TeacherApplication) {
    setActingOn(app.id);
    const supabase = createClient();
    await supabase
      .from("teacher_applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", app.id);
    showToast(t("applicationRejected"), "success");
    await loadData();
    setActingOn(null);
  }

  function openEdit(row: TeacherRow) {
    setEditingId(row.id);
    setEditForm(toEditForm(row));
  }

  function closeEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("teachers")
      .update({
        name: editForm.name,
        name_en: editForm.name_en || null,
        title: editForm.title || null,
        title_en: editForm.title_en || null,
        bio: editForm.bio || null,
        bio_en: editForm.bio_en || null,
        specialties: editForm.specialties.split(/[,،]/).map((s) => s.trim()).filter(Boolean),
        specialties_en: editForm.specialties_en.split(/[,،]/).map((s) => s.trim()).filter(Boolean),
        years_experience: Number(editForm.years_experience) || 0,
        students_count: Number(editForm.students_count) || 0,
        completed_sessions: Number(editForm.completed_sessions) || 0,
        rating: Number(editForm.rating) || 0,
        status: editForm.status,
      })
      .eq("id", editingId);

    setSaving(false);
    if (!error) {
      showToast(t("editSaved"), "success");
      closeEdit();
      await loadData();
    }
  }

  async function deleteTeacher(row: TeacherRow) {
    if (!window.confirm(t("deleteConfirm", { name: row.name }))) return;
    setActingOn(row.id);
    const supabase = createClient();
    const { error } = await supabase.from("teachers").delete().eq("id", row.id);
    if (!error) {
      showToast(t("teacherDeleted"), "success");
      await loadData();
    }
    setActingOn(null);
  }

  async function resendSetupEmail(row: TeacherRow) {
    setActingOn(row.id);
    try {
      const res = await fetch("/api/teacher-resend-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherRowId: row.id }),
      });
      if (res.ok) {
        showToast(t("resendSetupEmailSuccess"), "success");
      } else {
        const body = await res.json().catch(() => null);
        showToast(
          body?.reason === "no_account" ? t("resendSetupEmailNoAccount") : t("resendSetupEmailError"),
          "error"
        );
      }
    } catch {
      showToast(t("resendSetupEmailError"), "error");
    }
    setActingOn(null);
  }

  return (
    <DashboardShell navItems={adminNav} userName={tc("adminName")} userSubtitle={tc("adminTitle")} onLogout={handleLogout}>
      <DashboardPageHeader title={t("teachersTitle")} subtitle={t("teachersSubtitle")} />

      <div className="card mb-6 p-6">
        <h3 className="mb-4 text-base font-extrabold text-ink">{t("pendingApplicationsTitle")}</h3>
        {loading ? (
          <p className="text-sm text-ink-soft">…</p>
        ) : applications.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("noApplicationsReal")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app) => (
              <div key={app.id} className="rounded-2xl border border-line p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {app.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={app.photo_url} alt={app.full_name} className="h-12 w-12 rounded-full object-cover" />
                    )}
                    <div>
                      <h4 className="font-extrabold text-ink">{app.full_name}</h4>
                      <p className="text-xs text-ink-soft" dir="ltr">{app.phone} · {app.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(app)}
                      disabled={actingOn === app.id}
                      className="btn-primary px-4 py-2 text-xs disabled:opacity-70"
                    >
                      {t("applicationApprove")}
                    </button>
                    <button
                      onClick={() => reject(app)}
                      disabled={actingOn === app.id}
                      className="btn-outline px-4 py-2 text-xs disabled:opacity-70"
                    >
                      {t("applicationReject")}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
                  <p><span className="font-bold text-ink">{t("applicationExperience")}:</span> {app.years_experience ?? "—"}</p>
                  <p><span className="font-bold text-ink">{tc("specialty")}:</span> {app.specialties.join("، ") || "—"}</p>
                  {app.ijazah && (
                    <p className="sm:col-span-2"><span className="font-bold text-ink">{t("applicationIjazah")}:</span> {app.ijazah}</p>
                  )}
                  <p className="sm:col-span-2"><span className="font-bold text-ink">{t("applicationBio")}:</span> {app.bio}</p>
                  {app.certificate_path && (
                    <p className="sm:col-span-2">
                      <button onClick={() => viewCertificate(app)} className="text-xs font-bold text-gold-dark hover:underline">
                        {t("viewCertificate")}
                      </button>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="border-b border-line px-6 py-4">
          <h3 className="text-base font-extrabold text-ink">{t("currentTeachersTitle")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("specialty")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("studentsCount")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("rating")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                <th className="px-6 py-3 text-start font-bold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4 font-bold text-ink">{teacher.name}</td>
                  <td className="px-6 py-4 text-ink-soft">{teacher.specialties.join("، ")}</td>
                  <td className="px-6 py-4 text-ink-soft">{teacher.students_count.toLocaleString("en-US")}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 font-bold text-ink">
                      <IconStar className="h-3.5 w-3.5 text-gold-dark" />
                      {teacher.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-pill px-3 py-1 text-xs font-bold ${
                        teacher.status === "active"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400"
                      }`}
                    >
                      {teacher.status === "active" ? tStatus("teacherActive") : tStatus("teacherSuspended")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => openEdit(teacher)} className="text-xs font-bold text-gold-dark hover:underline">
                        {t("editTeacher")}
                      </button>
                      <button
                        onClick={() => resendSetupEmail(teacher)}
                        disabled={actingOn === teacher.id}
                        className="text-xs font-bold text-ink-soft hover:underline disabled:opacity-50"
                      >
                        {t("resendSetupEmail")}
                      </button>
                      <button
                        onClick={() => deleteTeacher(teacher)}
                        disabled={actingOn === teacher.id}
                        className="text-xs font-bold text-red-500 hover:underline disabled:opacity-50"
                      >
                        {t("deleteTeacher")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingId && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="animate-overlay-in absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="card animate-fade-up relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-7">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink">{t("editTeacher")}</h3>
              <button onClick={closeEdit} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">
                <IconX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldName")}</label>
                  <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldNameEn")}</label>
                  <input dir="ltr" className="input" value={editForm.name_en} onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldTitle")}</label>
                  <input className="input" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldTitleEn")}</label>
                  <input dir="ltr" className="input" value={editForm.title_en} onChange={(e) => setEditForm({ ...editForm, title_en: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">{t("fieldBio")}</label>
                <textarea rows={3} className="input resize-none" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">{t("fieldBioEn")}</label>
                <textarea dir="ltr" rows={3} className="input resize-none" value={editForm.bio_en} onChange={(e) => setEditForm({ ...editForm, bio_en: e.target.value })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldSpecialties")}</label>
                  <input className="input" value={editForm.specialties} onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldSpecialtiesEn")}</label>
                  <input dir="ltr" className="input" value={editForm.specialties_en} onChange={(e) => setEditForm({ ...editForm, specialties_en: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldYears")}</label>
                  <input type="number" dir="ltr" className="input" value={editForm.years_experience} onChange={(e) => setEditForm({ ...editForm, years_experience: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldStudents")}</label>
                  <input type="number" dir="ltr" className="input" value={editForm.students_count} onChange={(e) => setEditForm({ ...editForm, students_count: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldSessions")}</label>
                  <input type="number" dir="ltr" className="input" value={editForm.completed_sessions} onChange={(e) => setEditForm({ ...editForm, completed_sessions: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("fieldRating")}</label>
                  <input type="number" step="0.1" dir="ltr" className="input" value={editForm.rating} onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">{t("fieldStatus")}</span>
                <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1">
                  {(["active", "suspended"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, status: s })}
                      aria-pressed={editForm.status === s}
                      className={`rounded-pill py-2 text-sm font-bold transition-colors ${
                        editForm.status === s ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
                      }`}
                    >
                      {s === "active" ? tStatus("teacherActive") : tStatus("teacherSuspended")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button onClick={closeEdit} className="btn-outline">
                  {t("editCancel")}
                </button>
                <button onClick={saveEdit} disabled={saving} className="btn-primary disabled:opacity-70">
                  {saving ? t("editSaving") : t("editSave")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
