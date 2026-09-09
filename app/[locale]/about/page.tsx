import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Breadcrumb } from "@/components/ui";
import { IconEye, IconHeart, IconAward } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("metaTitle") };
}

export default function AboutPage() {
  const t = useTranslations("About");
  const tNav = useTranslations("Nav");

  const CARDS = [
    { icon: IconEye, title: t("visionTitle"), desc: t("visionDesc") },
    { icon: IconHeart, title: t("missionTitle"), desc: t("missionDesc") },
    { icon: IconAward, title: t("valuesTitle"), desc: t("valuesDesc") },
  ];

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("eyebrow") }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="text-3xl font-extrabold leading-snug text-ink sm:text-4xl">{t("title")}</h1>
          <p className="leading-relaxed text-ink-soft">{t("description")}</p>
        </div>
        <div className="card relative aspect-[4/3] overflow-hidden p-6">
          <div className="relative h-full w-full">
            <Image
              src="/images/about-illustration.jpg"
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 1024px) 500px, 85vw"
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.title} className="card flex flex-col items-center gap-3 p-7 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
              <c.icon className="h-7 w-7 text-gold-dark" />
            </div>
            <h3 className="text-base font-extrabold text-ink">{c.title}</h3>
            <p className="text-sm leading-relaxed text-ink-soft">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
