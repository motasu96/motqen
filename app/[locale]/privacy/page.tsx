import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Breadcrumb, Eyebrow } from "@/components/ui";

type Section = { title: string; body: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return { title: t("metaTitle") };
}

export default function PrivacyPage() {
  const t = useTranslations("Privacy");
  const tNav = useTranslations("Nav");
  const sections = t.raw("sections") as Section[];

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("privacy") }]} />

      <div className="mx-auto mt-8 max-w-3xl">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{t("title")}</h1>
        <p className="mt-3 text-sm text-ink-soft">{t("lastUpdated")}</p>
        <p className="mt-6 leading-loose text-ink-soft">{t("intro")}</p>

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-extrabold text-ink">{s.title}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {s.body.map((p, i) => (
                  <p key={i} className="leading-loose text-ink-soft">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-10 flex flex-col gap-2 p-7">
          <h3 className="text-base font-extrabold text-ink">{t("contactTitle")}</h3>
          <p className="text-sm leading-relaxed text-ink-soft">{t("contactDesc")}</p>
        </div>
      </div>
    </div>
  );
}
