"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { teacherNav } from "@/components/dashboard/teacherNav";
import { teacherNotices } from "@/data/dashboard";
import { IconMegaphone } from "@/components/icons";

export default function TeacherNoticesPage() {
  return (
    <DashboardShell navItems={teacherNav} userName="أ. عبدالله السلمي" userSubtitle="معلم قرآن كريم">
      <DashboardPageHeader title="الإعلانات" subtitle="آخر الإعلانات والتحديثات الموجهة للمعلمين" />

      <div className="flex flex-col gap-4">
        {teacherNotices.map((n) => (
          <div key={n.id} className="card flex gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
              <IconMegaphone className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <div className="mb-1 flex items-center justify-between gap-4">
                <h3 className="text-sm font-extrabold text-ink">{n.title}</h3>
                <span className="shrink-0 text-xs text-ink-soft">{n.date}</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
