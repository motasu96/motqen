import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb, Eyebrow } from "@/components/ui";
import { IconCheck, IconWhatsApp } from "@/components/icons";
import { ADMIN_WHATSAPP_NUMBER, whatsappHref } from "@/lib/contact";
import { createClient } from "@/lib/supabase/server";
import { listActivePackages, PackageRow, pricePerLesson } from "@/lib/supabase/packages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Packages.pricing" });
  return { title: t("metaTitle") };
}

async function loadPackages(): Promise<PackageRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    return await listActivePackages(await createClient());
  } catch {
    return [];
  }
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Packages.pricing");
  const tNav = await getTranslations("Nav");
  const steps = t.raw("steps") as string[];
  const packages = await loadPackages();
  const isEn = locale === "en";

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("pricing") }]} />

      <div className="mx-auto mt-8 max-w-4xl">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{t("title")}</h1>
        <p className="mt-4 leading-loose text-ink-soft">{t("intro")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card flex flex-col gap-2 border-gold p-6">
            <h2 className="text-base font-extrabold text-ink">{t("trialTitle")}</h2>
            <p className="text-sm leading-relaxed text-ink-soft">{t("trialDesc")}</p>
            <Link href="/signup" className="btn-primary mt-2 w-fit">
              {t("signupCta")}
            </Link>
          </div>
          <div className="card flex flex-col gap-2 p-6">
            <h2 className="text-base font-extrabold text-ink">{t("groupsTitle")}</h2>
            <p className="text-sm leading-relaxed text-ink-soft">{t("groupsDesc")}</p>
          </div>
        </div>

        <h2 className="mt-12 text-xl font-extrabold text-ink">{t("packagesTitle")}</h2>
        {packages.length === 0 ? (
          <div className="card mt-4 flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-ink-soft">{t("noPackages")}</p>
            <a
              href={whatsappHref(ADMIN_WHATSAPP_NUMBER, t("contactAdminMessage"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <IconWhatsApp className="h-4 w-4" aria-hidden="true" />
              {t("contactAdmin")}
            </a>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => {
              const name = isEn && p.name_en ? p.name_en : p.name;
              const description = isEn && p.description_en ? p.description_en : p.description;
              const message = t("subscribeMessage", { package: name, lessons: p.lessons_count, price: p.price_usd });
              return (
                <div key={p.id} className="card flex flex-col gap-3 p-6">
                  <h3 className="text-base font-extrabold text-ink">{name}</h3>
                  {description ? <p className="text-sm leading-relaxed text-ink-soft">{description}</p> : null}
                  <p className="text-3xl font-extrabold text-gold-dark" dir="ltr">
                    {t("price", { price: p.price_usd })}
                  </p>
                  <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
                    <li className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />
                      {t("lessons", { count: p.lessons_count })}
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />
                      {t("validity", { count: p.validity_days })}
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />
                      {t("perLesson", { price: pricePerLesson(p) })}
                    </li>
                  </ul>
                  <a
                    href={whatsappHref(ADMIN_WHATSAPP_NUMBER, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-pill bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <IconWhatsApp className="h-4 w-4" aria-hidden="true" />
                    {t("subscribe")}
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <h2 className="mt-12 text-xl font-extrabold text-ink">{t("howTitle")}</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={i} className="card flex items-start gap-4 p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-light text-sm font-extrabold text-gold-dark">
                {i + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-ink">{step}</p>
            </li>
          ))}
        </ol>

        <div className="card mt-10 flex flex-col gap-2 p-7">
          <h3 className="text-base font-extrabold text-ink">{t("policyTitle")}</h3>
          <p className="text-sm leading-relaxed text-ink-soft">{t("policy")}</p>
        </div>
      </div>
    </div>
  );
}
