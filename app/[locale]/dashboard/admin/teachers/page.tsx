"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { createClient } from "@/lib/supabase/client";
import { generateUniqueSlug } from "@/lib/supabase/teachers";
import { useToast } from "@/components/Toast";
import { IconStar } from "@/components/icons";

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
};

type TeacherRow = {
  id: string;
  name: string;
  specialties: string[];
  students_count: number;
  rating: number;
  created_at: string;
  status: "active" | "suspended";
};

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

  async function loadData() {
    const supabase = createClient();
    const [{ data: apps }, { data: teacherRows }] = await Promise.all([
      supabase.from("teacher_applications").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("teachers").select("id, name, specialties, students_count, rating, created_at, status").order("created_at", { ascending: false }),
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

    const { error: insertError } = await supabase.from("teachers").insert({
      slug,
      name: app.full_name,
      gender: app.gender,
      specialties: app.specialties,
      years_experience: app.years_experience ?? 0,
      bio: app.bio,
      application_id: app.id,
      status: "active",
    });

    if (!insertError) {
      await supabase
        .from("teacher_applications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", app.id);
      showToast(t("applicationApproved"), "success");
      await loadData();
    }
    setActingOn(null);
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
                  <div>
                    <h4 className="font-extrabold text-ink">{app.full_name}</h4>
                    <p className="text-xs text-ink-soft" dir="ltr">{app.phone} · {app.email}</p>
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
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("specialty")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("studentsCount")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("rating")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
