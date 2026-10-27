"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import {
  BookingCredit,
  getMyBookingCredit,
  listActivePackages,
  listStudentPackages,
  PackageRow,
  pricePerLesson,
  StudentPackageRow,
  subscriptionState,
  SubscriptionState,
} from "@/lib/supabase/packages";
import { ADMIN_WHATSAPP_NUMBER, whatsappHref } from "@/lib/contact";
import { IconWhatsApp } from "@/components/icons";
import { Link } from "@/i18n/navigation";

const STATE_BADGE: Record<SubscriptionState, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  exhausted: "bg-gold-light text-gold-dark",
  expired: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  void: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
};

function WhatsAppLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-pill bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
    >
      <IconWhatsApp className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}

export default function StudentPackagesPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const t = useTranslations("Packages.student");
  const tp = useTranslations("Packages.pricing");

  const [credit, setCredit] = useState<BookingCredit | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<StudentPackageRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const [c, pk, subs] = await Promise.all([getMyBookingCredit(supabase), listActivePackages(supabase), listStudentPackages(supabase)]);
      if (cancelled) return;
      setCredit(c);
      setPackages(pk);
      setSubscriptions(subs);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nameParams = { hasName: studentName ? "yes" : "no", student: studentName ?? "" };
  const adminHref = whatsappHref(ADMIN_WHATSAPP_NUMBER, t("contactAdminMessage", nameParams));

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("title")} subtitle={t("subtitle")} />

      {!ready ? null : (
        <div className="flex flex-col gap-8">
          <section className="card flex flex-col gap-3 p-6">
            <h2 className="text-base font-extrabold text-ink">{t("balanceTitle")}</h2>
            {credit === null || (credit.lessonsLeft === 0 && !credit.trialAvailable) ? (
              <p className="text-sm text-ink-soft">{t("noLessons")}</p>
            ) : null}
            {credit && credit.lessonsLeft > 0 ? (
              <>
                <p className="text-2xl font-extrabold text-gold-dark">{t("lessonsLeft", { count: credit.lessonsLeft })}</p>
                {credit.nextExpiry ? <p className="text-xs text-ink-soft">{t("expiresOn", { date: credit.nextExpiry.slice(0, 10) })}</p> : null}
              </>
            ) : null}
            {credit?.trialAvailable ? <p className="text-sm font-bold text-ink">{t("trialAvailable")}</p> : null}
            <p className="text-xs text-ink-soft">{t("policy")}</p>
            {credit?.trialAvailable || (credit && credit.lessonsLeft > 0) ? (
              <Link href="/dashboard/student/teachers" className="btn-outline w-fit">
                {t("bookNow")}
              </Link>
            ) : null}
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-ink">{t("buyTitle")}</h2>
              <p className="text-sm text-ink-soft">{t("buyHint")}</p>
            </div>
            {packages.length === 0 ? (
              <div className="card flex flex-col items-start gap-3 p-6">
                <p className="text-sm text-ink-soft">{t("noPackages")}</p>
                <WhatsAppLink href={adminHref} label={t("contactAdmin")} />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {packages.map((p) => {
                  const message = t("subscribeMessage", { ...nameParams, package: p.name, lessons: p.lessons_count, price: p.price_usd });
                  return (
                    <div key={p.id} className="card flex flex-col gap-3 p-6">
                      <h3 className="text-base font-extrabold text-ink">{p.name}</h3>
                      {p.description ? <p className="text-sm text-ink-soft">{p.description}</p> : null}
                      <p className="text-2xl font-extrabold text-gold-dark" dir="ltr">
                        {tp("price", { price: p.price_usd })}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {tp("lessons", { count: p.lessons_count })} · {tp("validity", { count: p.validity_days })}
                        <br />
                        {tp("perLesson", { price: pricePerLesson(p) })}
                      </p>
                      <WhatsAppLink href={whatsappHref(ADMIN_WHATSAPP_NUMBER, message)} label={t("subscribe")} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-ink">{t("mySubscriptions")}</h2>
            {subscriptions.length === 0 ? (
              <div className="card p-6">
                <p className="text-sm text-ink-soft">{t("noSubscriptions")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {subscriptions.map((s) => {
                  const state = subscriptionState(s);
                  return (
                    <div key={s.id} className="card flex flex-wrap items-center gap-4 p-5">
                      <div className="min-w-[160px] flex-1">
                        <h3 className="text-sm font-extrabold text-ink">{s.packageName}</h3>
                        <p className="text-xs text-ink-soft">
                          {t("usedOf", { used: s.lessonsUsed, total: s.lessonsTotal })} · {t("expires", { date: s.expiresAt.slice(0, 10) })}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATE_BADGE[state]}`}>{t(`states.${state}`)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
