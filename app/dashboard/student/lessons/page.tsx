"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { studentNav } from "@/components/dashboard/studentNav";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { lessons } from "@/data/dashboard";
import { IconClock } from "@/components/icons";

const STATUS_STYLES: Record<(typeof lessons)[number]["status"], string> = {
  مكتملة: "bg-emerald-50 text-emerald-600",
  قادمة: "bg-gold-light text-gold-dark",
  ملغاة: "bg-red-50 text-red-500",
};

export default function StudentLessonsPage() {
  return (
    <DashboardShell navItems={studentNav} userName="أحمد محمد" userSubtitle="طالب في برنامج الحفظ المتقن">
      <DashboardPageHeader title="دروسي" subtitle="سجل حصصك السابقة والقادمة مع معلمك" />

      <div className="flex flex-col gap-4">
        {lessons.map((l) => (
          <div key={l.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                <IconClock className="h-5 w-5 text-gold-dark" />
              </span>
              <div>
                <div className="text-sm font-extrabold text-ink">{l.surah} — {l.range}</div>
                <div className="text-xs text-ink-soft">{l.date} · الساعة {l.time} · مع {l.teacher}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-fit rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[l.status]}`}>
                {l.status}
              </span>
              {l.status === "قادمة" && (
                <JoinMeetingButton room={l.id} displayName="أحمد محمد" subject={`${l.surah} — ${l.range}`} />
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
