import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProgramBySlug, programs } from "@/data/programs";
import { Breadcrumb } from "@/components/ui";
import { IconCalendar, IconCheck, IconClock, IconUsers } from "@/components/icons";
import { localize } from "@/lib/localize";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const program = getProgramBySlug(slug);
  if (!program) return {};
  const p = localize(program, locale);
  const t = await getTranslations({ locale, namespace: "Site" });
  return {
    title: `${p.title} | ${t("siteName")}`,
    description: p.short,
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) notFound();

  return <ProgramDetailContent program={program} />;
}

function ProgramDetailContent({ program }: { program: NonNullable<ReturnType<typeof getProgramBySlug>> }) {
  const locale = useLocale();
  const t = useTranslations("Programs");
  const tNav = useTranslations("Nav");
  const p = localize(program, locale);

  return (
    <div className="container-page section">
      <Breadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("programs"), href: "/programs" },
          { label: p.title },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <div className="card flex items-center gap-6 overflow-hidden p-8">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full sm:h-28 sm:w-28">
              <Image
                src={program.image}
                alt={p.title}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{p.title}</h1>
              <p className="mt-2 text-ink-soft">{p.short}</p>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="mb-4 text-lg font-extrabold text-ink">{t("aboutProgram")}</h2>
            <p className="leading-relaxed text-ink-soft">{p.description}</p>
          </div>

          <div className="card p-8">
            <h2 className="mb-5 text-lg font-extrabold text-ink">{t("featuresTitle")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-light">
                    <IconCheck className="h-3.5 w-3.5 text-gold-dark" />
                  </span>
                  <span className="text-sm leading-relaxed text-ink-soft">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card flex flex-col gap-6 p-7">
            <div>
              <span className="text-sm text-ink-soft">{t("startsFrom")}</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gold-dark">{program.price}</span>
                <span className="text-sm font-bold text-ink-soft">{t("perMonth")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-y border-line py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-soft">
                  <IconClock className="h-4 w-4 text-gold" />
                  {t("sessionDuration")}
                </span>
                <span className="font-bold text-ink">{program.sessionMinutes} {t("minutes")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-soft">
                  <IconCalendar className="h-4 w-4 text-gold" />
                  {t("sessionCount")}
                </span>
                <span className="font-bold text-ink">{program.sessionsPerWeek} {t("perWeek")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-soft">
                  <IconUsers className="h-4 w-4 text-gold" />
                  {t("ageGroup")}
                </span>
                <span className="font-bold text-ink">{p.ageGroup}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/signup?program=${program.slug}`} className="btn-primary w-full">
                {t("bookNow")} ‹
              </Link>
              <Link href="/contact" className="btn-outline w-full">
                {t("freeConsult")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
