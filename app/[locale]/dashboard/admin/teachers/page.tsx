"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { adminTeachers, AdminTeacher } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconStar } from "@/components/icons";

const STATUS_KEYS: Record<AdminTeacher["status"], "teacherActive" | "teacherPending" | "teacherSuspended"> = {
  نشط: "teacherActive",
  "قيد المراجعة": "teacherPending",
  موقوف: "teacherSuspended",
};

const STATUS_STYLES: Record<AdminTeacher["status"], string> = {
  نشط: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  "قيد المراجعة": "bg-gold-light text-gold-dark",
  موقوف: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
};

export default function AdminTeachersPage() {
  const adminNav = useAdminNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={adminNav} userName={tc("adminName")} userSubtitle={tc("adminTitle")}>
      <DashboardPageHeader title={t("teachersTitle")} subtitle={t("teachersSubtitle")} />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-ink-soft">
                <th className="px-6 py-3 text-start font-bold">{tc("name")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("specialty")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("studentsCount")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("rating")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("joinDateLabel")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                <th className="px-6 py-3 text-start font-bold">{tc("action")}</th>
              </tr>
            </thead>
            <tbody>
              {adminTeachers.map((t0) => {
                const teacher = localize(t0, locale);
                return (
                  <tr key={teacher.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{teacher.name}</td>
                    <td className="px-6 py-4 text-ink-soft">{teacher.specialty}</td>
                    <td className="px-6 py-4 text-ink-soft">{teacher.students.toLocaleString("en-US")}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 font-bold text-ink">
                        <IconStar className="h-3.5 w-3.5 text-gold-dark" />
                        {teacher.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-soft">{teacher.joinDate}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[t0.status]}`}>
                        {tStatus(STATUS_KEYS[t0.status])}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-bold text-gold-dark hover:underline">{tc("viewProfile")}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
