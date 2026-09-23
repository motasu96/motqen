import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCertificate, PublicCertificate } from "@/lib/supabase/certificates";
import { certificateTitle, amountShort, gregorianDate, hijriDate } from "@/lib/certificateFormat";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { IconAward, IconX } from "@/components/icons";

export const dynamic = "force-dynamic";

async function loadCertificate(code: string): Promise<PublicCertificate | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = await createClient();
    return await verifyCertificate(supabase, code);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Verify" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string; locale: string }>;
}) {
  const { code, locale } = await params;
  const cert = await loadCertificate(code);
  const t = await getTranslations({ locale, namespace: "Verify" });

  const program = cert?.program_slug ? programs.find((p) => p.slug === cert.program_slug) : null;
  const programTitle = program ? localize(program, locale).title : null;

  return (
    <div className="container-page section flex justify-center">
      <div className="card w-full max-w-lg p-8">
        {cert ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/15">
              <IconAward className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-ink">{t("validTitle")}</h1>
              <p className="mt-1 text-sm text-ink-soft">{t("validDesc")}</p>
            </div>

            <div className="mt-2 flex w-full flex-col gap-3 rounded-2xl border border-line bg-bg p-5 text-start">
              <div>
                <div className="text-xs text-ink-soft">{t("labelStudent")}</div>
                <div className="text-base font-extrabold text-ink">{cert.student_name}</div>
              </div>
              <div>
                <div className="text-xs text-ink-soft">{t("labelAchievement")}</div>
                <div className="text-sm font-bold text-ink">
                  {certificateTitle(cert.scope, locale)} — {amountShort(cert.scope, cert.juz_count, locale)}
                </div>
                <div className="text-xs text-ink-soft">{cert.narration}</div>
              </div>
              {programTitle && (
                <div>
                  <div className="text-xs text-ink-soft">{t("labelProgram")}</div>
                  <div className="text-sm font-bold text-ink">{programTitle}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-ink-soft">{t("labelDate")}</div>
                <div className="text-sm font-bold text-ink">
                  {gregorianDate(cert.issued_at, locale)} — {hijriDate(cert.issued_at, locale)}
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-soft">{t("labelNumber")}</div>
                <div dir="ltr" className="text-end text-sm font-bold text-ink">
                  {cert.certificate_number}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/15">
              <IconX className="h-7 w-7 text-red-500" />
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-ink">{t("invalidTitle")}</h1>
              <p className="mt-1 text-sm text-ink-soft">{t("invalidDesc")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
