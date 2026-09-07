"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { teacherNav } from "@/components/dashboard/teacherNav";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { teacherSchedule } from "@/data/dashboard";
import { IconClock } from "@/components/icons";

const DAYS_ORDER = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function TeacherSchedulePage() {
  const byDay = DAYS_ORDER.map((day) => ({
    day,
    slots: teacherSchedule.filter((s) => s.day === day),
  }));

  return (
    <DashboardShell navItems={teacherNav} userName="أ. عبدالله السلمي" userSubtitle="معلم قرآن كريم">
      <DashboardPageHeader title="الجدول" subtitle="جدولك الأسبوعي مع الطلاب" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {byDay.map(({ day, slots }) => (
          <div key={day} className="card flex flex-col gap-3 p-5">
            <h3 className="text-sm font-extrabold text-ink">{day}</h3>
            {slots.length === 0 ? (
              <p className="text-xs text-ink-soft">لا توجد حصص</p>
            ) : (
              <div className="flex flex-col gap-2">
                {slots.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-line bg-bg p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gold-dark">
                      <IconClock className="h-3.5 w-3.5" />
                      {s.time}
                    </div>
                    <div className="text-sm font-bold text-ink">{s.student}</div>
                    <div className="mb-3 text-xs text-ink-soft">{s.program}</div>
                    <JoinMeetingButton
                      room={s.id}
                      displayName="أ. عبدالله السلمي"
                      subject={`${s.student} — ${s.program}`}
                      label="بدء الحصة"
                      className="w-full justify-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
