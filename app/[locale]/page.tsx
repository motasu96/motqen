import Image from "next/image";
import { useTranslations } from "next-intl";
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

export default function HomePage() {
  const t = useTranslations("Home");

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
        <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-up order-2 flex flex-col items-start gap-6 lg:order-1">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h1 className="text-4xl font-extrabold leading-[1.25] text-ink sm:text-5xl md:text-6xl">
              {t("titleLine1")}
              <br />
              {t("titleLine2Before")}
              <span className="text-gold-dark">{t("titleLine2Gold")}</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">{t("description")}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup" className="btn-primary">
                {t("ctaStart")} ‹
              </Link>
              <Link href="/programs" className="btn-outline">
                <IconPlay className="h-4 w-4" />
                {t("ctaExplore")}
              </Link>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-light">
                <IconAward className="h-6 w-6 text-gold-dark" />
              </div>
              <span className="text-sm font-bold text-ink-soft">{t("certifiedBadge")}</span>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-card-lg bg-card shadow-soft">
              <Image
                src="/images/hero-quran.jpg"
                alt={t("heroImageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 448px, 90vw"
                className="object-cover"
              />
              {HERO_BADGES.map((b) => (
                <div
                  key={b.title}
                  className={`absolute flex max-w-[112px] items-center gap-1.5 rounded-2xl border border-line bg-card px-2.5 py-1.5 shadow-soft sm:max-w-[150px] sm:gap-2 sm:px-3 sm:py-2 ${b.position}`}
                >
                  <b.icon className="h-4 w-4 shrink-0 text-gold-dark sm:h-5 sm:w-5" aria-hidden="true" />
                  <span className="text-[10px] font-bold leading-tight text-ink sm:text-xs">{b.title}</span>
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
