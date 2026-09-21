"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { getTeacherBookingInfo } from "@/lib/supabase/teachers";
import BookingCalendar from "@/components/dashboard/BookingCalendar";
import { IconCalendar } from "@/components/icons";

type AuthState = "loading" | "guest" | "student" | "other";

export default function TeacherBookingSection({ teacherSlug }: { teacherSlug: string }) {
  const t = useTranslations("Teachers");
  const [state, setState] = useState<AuthState>("loading");
  const [info, setInfo] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        if (!cancelled) setState("guest");
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setState("guest");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (cancelled) return;
      if (profile?.role !== "student") {
        setState("other");
        return;
      }
      const teacherInfo = await getTeacherBookingInfo(supabase, teacherSlug);
      if (cancelled) return;
      setInfo(teacherInfo);
      setState("student");
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [teacherSlug]);

  if (state === "loading" || state === "other") return null;

  return (
    <div id="book" className="mt-8 scroll-mt-24">
      {state === "guest" ? (
        <div className="card flex flex-col items-center gap-3 p-7 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-light">
            <IconCalendar className="h-6 w-6 text-gold-dark" />
          </span>
          <h3 className="text-base font-extrabold text-ink">{t("bookingLoginRequiredTitle")}</h3>
          <p className="text-sm text-ink-soft">{t("bookingLoginRequiredDesc")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn-primary">
              {t("bookingLoginCta")}
            </Link>
            <Link href={`/signup?teacher=${teacherSlug}`} className="btn-outline">
              {t("bookingSignupCta")}
            </Link>
          </div>
        </div>
      ) : info ? (
        <BookingCalendar teacherId={info.id} teacherName={info.name} />
      ) : null}
    </div>
  );
}
