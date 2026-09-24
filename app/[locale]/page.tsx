import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { programs } from "@/data/programs";
import ProgramCard from "@/components/ProgramCard";
import { Eyebrow, SectionHeading, Stat } from "@/components/ui";
import {
  IconAward,
  IconEye,
  IconHeart,
  IconPlay,
  IconShield,
  IconCalendar,
  IconTeacherBadge,
  IconTarget,
} from "@/components/icons";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const FEATURES = [
    { icon: IconShield, title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: IconCalendar, title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: IconTeacherBadge, title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: IconPlay, title: t("feature4Title"), desc: t("feature4Desc") },
  ];

  const HERO_BADGES = [
    { ...FEATURES[3], position: "right-3 top-3 sm:right-6 sm:top-6" },
    { ...FEATURES[0], position: "left-3 top-3 sm:left-6 sm:top-6" },
    { ...FEATURES[2], position: "right-3 bottom-3 sm:right-6 sm:bottom-6" },
    { ...FEATURES[1], position: "left-3 bottom-3 sm:left-6 sm:bottom-6" },
  ];

  const STATS = [
    { value: "+1000", label: t("stat1Label") },
    { value: "+30", label: t("stat2Label") },
    { value: "+150", label: t("stat3Label") },
    { value: "+1500", label: t("stat4Label") },
  ];

  const VALUES = [
    { icon: IconTarget, title: t("value1Title"), desc: t("value1Desc") },
    { icon: IconEye, title: t("value2Title"), desc: t("value2Desc") },
    { icon: IconHeart, title: t("value3Title"), desc: t("value3Desc") },
    { icon: IconAward, title: t("value4Title"), desc: t("value4Desc") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page relative grid grid-cols-2 items-center gap-3 py-10 sm:gap-6 sm:py-14 md:gap-10 lg:gap-12 lg:py-20">
          <div className="animate-fade-up order-1 flex flex-col items-start gap-2 sm:gap-4 lg:gap-6">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h1 className="text-lg font-extrabold leading-[1.2] text-ink sm:text-2xl md:text-4xl lg:text-6xl lg:leading-[1.25]">
              {t("titleLine1")}
              <br />
              {t("titleLine2Before")}
              <span className="text-gold-dark">{t("titleLine2Gold")}</span>
            </h1>
            <p className="text-xs leading-relaxed text-ink-soft sm:max-w-lg sm:text-base lg:text-lg">{t("description")}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Link href="/signup" className="btn-primary px-3 py-1.5 text-xs sm:px-6 sm:py-3 sm:text-sm">
                {t("ctaStart")} ‹
              </Link>
              <Link href="/programs" className="btn-outline px-3 py-1.5 text-xs sm:px-6 sm:py-3 sm:text-sm">
                <IconPlay className="h-3 w-3 sm:h-4 sm:w-4" />
                {t("ctaExplore")}
              </Link>
            </div>
            <div className="flex items-center gap-2 pt-1 sm:gap-3 sm:pt-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-light sm:h-12 sm:w-12">
                <IconAward className="h-4 w-4 text-gold-dark sm:h-6 sm:w-6" />
              </div>
              <span className="text-[11px] font-bold text-ink-soft sm:text-sm">{t("certifiedBadge")}</span>
            </div>
          </div>

          <div className="order-2 flex justify-center">
            <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-2xl bg-card shadow-soft sm:rounded-card-lg">
              <Image
                src="/images/hero-illustration-new.png"
                alt={t("heroImageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 448px, 45vw"
                className="object-cover"
              />
              {HERO_BADGES.map((b, i) => (
                <div
                  key={b.title}
                  style={{ animationDelay: `${i * 0.5}s` }}
                  className={`animate-float absolute hidden lg:block ${b.position}`}
                >
                  <div className="group flex max-w-[150px] cursor-default items-center gap-2 rounded-2xl border border-line bg-card px-3 py-2 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:border-gold/50 hover:shadow-[0_20px_36px_-16px_rgba(200,155,74,0.45)]">
                    <b.icon className="h-5 w-5 shrink-0 text-gold-dark transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
                    <span className="text-xs font-bold leading-tight text-ink">{b.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page pb-6">
        <div className="card grid grid-cols-2 gap-6 p-6 sm:p-8 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-light">
                <f.icon className="h-6 w-6 text-gold-dark" />
              </div>
              <h3 className="text-sm font-extrabold text-ink">{f.title}</h3>
              <p className="text-xs leading-relaxed text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow={t("programsEyebrow")} title={t("programsTitle")} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 6).map((p) => (
              <ProgramCard key={p.slug} program={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-page pb-6">
        <div className="card grid grid-cols-2 gap-8 p-8 sm:p-10 md:grid-cols-4">
          {STATS.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="section">
        <div className="container-page">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <svg viewBox="0 0 40 32" className="h-10 w-10 text-gold-light" fill="currentColor">
              <path d="M0 20C0 9 8 2 18 0l2 5C13 7 9 11 8 16h10v16H0V20Zm22 0C22 9 30 2 40 0l2 5c-7 2-11 6-12 11h10v16H22V20Z" />
            </svg>
            <p className="max-w-2xl text-xl font-extrabold leading-relaxed text-ink sm:text-2xl">{t("quote")}</p>
            <span className="text-sm text-ink-soft">— {t("quoteSource")}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card flex flex-col items-center gap-3 p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
                  <v.icon className="h-7 w-7 text-gold-dark" />
                </div>
                <h3 className="text-base font-extrabold text-ink">{v.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
