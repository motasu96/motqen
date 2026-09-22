"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId } from "@/lib/supabase/teacherStudents";
import { listTeacherBookings, TeacherBooking } from "@/lib/supabase/bookings";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { IconClock } from "@/components/icons";

export default function TeacherSchedulePage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");

  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [ready, setReady] = useState(false);

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
      const rows = await listTeacherBookings(supabase, tId);
      if (cancelled) return;
      setBookings(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today);

  const byDate = new Map<string, TeacherBooking[]>();
  for (const b of upcoming) {
    const arr = byDate.get(b.date) ?? [];
    arr.push(b);
    byDate.set(b.date, arr);
  }
  const dates = Array.from(byDate.keys()).sort();

  return (
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("scheduleTitle")} subtitle={t("scheduleSubtitle")} />

      {!ready ? null : dates.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noSessions")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dates.map((date) => (
            <div key={date} className="card flex flex-col gap-3 p-5">
              <h3 className="text-sm font-extrabold text-ink">{date}</h3>
              <div className="flex flex-col gap-2">
                {(byDate.get(date) ?? []).map((b) => (
                  <div key={b.id} className="rounded-2xl border border-line bg-bg p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gold-dark">
                      <IconClock className="h-3.5 w-3.5" />
                      {b.time}
                    </div>
                    <div className="mb-3 text-sm font-bold text-ink">{b.studentName || tc("dash")}</div>
                    <JoinMeetingButton
                      room={b.id}
                      displayName={teacherName}
                      subject={b.studentName}
                      label={t("startSessionCta")}
                      className="w-full justify-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
