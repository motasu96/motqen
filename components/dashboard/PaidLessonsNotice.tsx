"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { UpcomingBooking } from "@/lib/supabase/bookings";
import { getTeacherWhatsApps } from "@/lib/supabase/teachers";
import { ADMIN_WHATSAPP_NUMBER, whatsappHref } from "@/lib/contact";
import { IconWhatsApp } from "@/components/icons";

// Private lessons used to be free. A student who already had private
// bookings before that changed never goes through the booking flow's
// "it's paid, contact us" step again, so this tells them on their home
// page instead — with WhatsApp links to the administration (prefilled
// with their upcoming bookings) and to any of their teachers who shared
// a number.
export default function PaidLessonsNotice({
  upcoming,
  studentName,
}: {
  upcoming: UpcomingBooking[];
  studentName: string | null;
}) {
  const t = useTranslations("Dashboard.student");
  const [teacherWhatsApps, setTeacherWhatsApps] = useState<Map<string, string>>(new Map());

  const teachers = useMemo(() => {
    const byId = new Map<string, string>();
    for (const b of upcoming) byId.set(b.teacherId, b.teacherName);
    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [upcoming]);
  const teacherIdsKey = teachers.map((tr) => tr.id).join(",");

  useEffect(() => {
    if (!teacherIdsKey) return;
    let cancelled = false;
    (async () => {
      const map = await getTeacherWhatsApps(createClient(), teacherIdsKey.split(","));
      if (!cancelled) setTeacherWhatsApps(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherIdsKey]);

  if (upcoming.length === 0) return null;

  const nameParams = { hasName: studentName ? "yes" : "no", student: studentName ?? "" };
  const bookingsList = upcoming
    .map((b) => t("paidNoticeBookingItem", { teacher: b.teacherName, date: b.date, time: b.time }))
    .join(t("paidNoticeBookingSeparator"));
  const adminHref = whatsappHref(ADMIN_WHATSAPP_NUMBER, t("paidNoticeAdminMessage", { ...nameParams, bookings: bookingsList }));

  return (
    <div className="card flex flex-col gap-4 border-gold p-6">
      <div>
        <h3 className="text-base font-extrabold text-ink">{t("paidNoticeTitle")}</h3>
        <p className="mt-1 text-sm text-ink-soft">{t("paidNoticeDesc", { count: upcoming.length })}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={adminHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-pill bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <IconWhatsApp className="h-4 w-4" aria-hidden="true" />
          {t("contactAdminWhatsApp")}
        </a>
        {teachers.map((tr) => {
          const number = teacherWhatsApps.get(tr.id);
          if (!number) return null;
          return (
            <a
              key={tr.id}
              href={whatsappHref(number, t("teacherPricingMessage", nameParams))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <IconWhatsApp className="h-4 w-4" aria-hidden="true" />
              {t("contactTeacherWhatsApp", { teacher: tr.name })}
            </a>
          );
        })}
      </div>
    </div>
  );
}
