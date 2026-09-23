"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { getTeacherBookingInfo, getTeacherBySlugFromDb } from "@/lib/supabase/teachers";
import { Teacher } from "@/data/teachers";
import { Rating } from "@/components/ui";
import { IconTeacherBadge } from "@/components/icons";
import TeacherProfileTabs from "@/components/TeacherProfileTabs";
import BookingCalendar from "@/components/dashboard/BookingCalendar";
import { localize } from "@/lib/localize";

export default function StudentTeacherProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tTeachers = useTranslations("Teachers");

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [bookingInfo, setBookingInfo] = useState<{ id: string; name: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !slug) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const [teacherData, info] = await Promise.all([
        getTeacherBySlugFromDb(supabase, slug),
        getTeacherBookingInfo(supabase, slug),
      ]);
      if (cancelled) return;
      setTeacher(teacherData);
      setBookingInfo(info);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const te = teacher ? localize(teacher, locale) : null;

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <Link href="/dashboard/student/teachers" className="mb-5 inline-block text-xs font-bold text-gold-dark hover:underline">
        {t("backToTeachers")}
      </Link>

      {!ready ? null : !teacher || !te ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <IconTeacherBadge className="h-8 w-8 text-gold-dark" aria-hidden="true" />
          <p className="text-sm text-ink-soft">{tTeachers("noTeachersTitle")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="card flex h-fit flex-col items-center gap-5 p-7 text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full">
                <Image src={teacher.avatarUrl} alt={te.name} fill sizes="112px" className="object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-ink">{te.name}</h1>
                <p className="mt-1 text-sm text-ink-soft">{te.title}</p>
              </div>
              <Rating value={teacher.stats.rating} />

              <div className="grid w-full grid-cols-2 gap-4 border-t border-line pt-5 text-center">
                <div>
                  <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.students}</div>
                  <div className="text-xs text-ink-soft">{tTeachers("statStudents")}</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.yearsExperience}</div>
                  <div className="text-xs text-ink-soft">{tTeachers("statYears")}</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.completedSessions}</div>
                  <div className="text-xs text-ink-soft">{tTeachers("statSessions")}</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-gold-dark">{teacher.stats.rating}</div>
                  <div className="text-xs text-ink-soft">{tTeachers("statRating")}</div>
                </div>
              </div>
            </aside>

            <TeacherProfileTabs teacher={teacher} />
          </div>

          {bookingInfo && (
            <div className="mt-8">
              <BookingCalendar teacherId={bookingInfo.id} teacherName={bookingInfo.name} />
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
