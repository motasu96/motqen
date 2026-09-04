"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { studentNav } from "@/components/dashboard/studentNav";
import { studentNotices } from "@/data/dashboard";
import { IconMegaphone } from "@/components/icons";

export default function StudentNoticesPage() {
  return (
    <DashboardShell navItems={studentNav} userName="أحمد محمد" userSubtitle="طالب في برنامج الحفظ المتقن">
      <DashboardPageHeader title="الإعلانات" subtitle="آخر الإعلانات والتحديثات من مقرأة متقن" />

      <div className="flex flex-col gap-4">
        {studentNotices.map((n) => (
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
