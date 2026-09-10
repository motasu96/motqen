"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { lessons } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconClock } from "@/components/icons";

const STATUS_KEYS: Record<(typeof lessons)[number]["status"], "lessonCompleted" | "lessonUpcoming" | "lessonCancelled"> = {
  مكتملة: "lessonCompleted",
  قادمة: "lessonUpcoming",
  ملغاة: "lessonCancelled",
};

const STATUS_STYLES: Record<(typeof lessons)[number]["status"], string> = {
  مكتملة: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  قادمة: "bg-gold-light text-gold-dark",
  ملغاة: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
};

export default function StudentLessonsPage() {
  const studentNav = useStudentNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");

  return (
    <DashboardShell navItems={studentNav} userName={tc("studentName")} userSubtitle={tc("studentTitle")}>
      <DashboardPageHeader title={t("lessonsTitle")} subtitle={t("lessonsSubtitle")} />

      <div className="flex flex-col gap-4">
        {lessons.map((l0) => {
          const l = localize(l0, locale);
          return (
            <div key={l.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                  <IconClock className="h-5 w-5 text-gold-dark" />
                </span>
                <div>
                  <div className="text-sm font-extrabold text-ink">{l.surah} — {l.range}</div>
                  <div className="text-xs text-ink-soft">{l.date} · {tc("at")} {l.time} · {tc("with")} {l.teacher}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`w-fit rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[l0.status]}`}>
                  {tStatus(STATUS_KEYS[l0.status])}
                </span>
                {l0.status === "قادمة" && (
                  <JoinMeetingButton room={l0.id} displayName={tc("studentName")} subject={`${l.surah} — ${l.range}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
