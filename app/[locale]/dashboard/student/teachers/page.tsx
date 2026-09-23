"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { getActiveTeachers } from "@/lib/supabase/teachers";
import { Teacher } from "@/data/teachers";
import { Rating } from "@/components/ui";
import { IconTeacherBadge } from "@/components/icons";
import { localize } from "@/lib/localize";

export default function StudentTeachersPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tTeachers = useTranslations("Teachers");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const rows = await getActiveTeachers(createClient());
      if (cancelled) return;
      setTeachers(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("browseTeachersTitle")} subtitle={t("browseTeachersSubtitle")} />

      {!ready ? null : teachers.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <IconTeacherBadge className="h-8 w-8 text-gold-dark" aria-hidden="true" />
          <h3 className="text-base font-extrabold text-ink">{tTeachers("noTeachersTitle")}</h3>
          <p className="text-sm text-ink-soft">{tTeachers("noTeachersDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => {
            const te = localize(teacher, locale);
            return (
              <Link
                key={teacher.slug}
                href={`/dashboard/student/teachers/${teacher.slug}`}
                className="card-interactive flex flex-col items-center gap-4 p-7 text-center"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full">
                  <Image src={teacher.avatarUrl} alt={te.name} fill sizes="80px" className="object-cover" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink">{te.name}</h3>
                  <p className="text-sm text-ink-soft">{te.title}</p>
                </div>
                <Rating value={teacher.stats.rating} />
                <span className="text-xs text-ink-soft">
                  {teacher.stats.students}+ {tTeachers("studentsSuffix")} · {teacher.stats.yearsExperience}+ {tTeachers("yearsSuffix")}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
