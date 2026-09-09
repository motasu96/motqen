import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { teachers } from "@/data/teachers";
import { Breadcrumb, Rating } from "@/components/ui";
import { localize } from "@/lib/localize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Teachers" });
  return { title: t("metaTitle") };
}

export default function TeachersPage() {
  const locale = useLocale();
  const t = useTranslations("Teachers");
  const tNav = useTranslations("Nav");

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("title") }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="max-w-xl text-ink-soft">{t("description")}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => {
          const te = localize(teacher, locale);
          return (
            <Link key={teacher.slug} href={`/teachers/${teacher.slug}`} className="card-interactive flex flex-col items-center gap-4 p-7 text-center">
              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                <Image src={teacher.avatarUrl} alt={te.name} fill sizes="80px" className="object-cover" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-ink">{te.name}</h3>
                <p className="text-sm text-ink-soft">{te.title}</p>
              </div>
              <Rating value={teacher.stats.rating} />
              <span className="text-xs text-ink-soft">
                {teacher.stats.students}+ {t("studentsSuffix")} · {teacher.stats.yearsExperience}+ {t("yearsSuffix")}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
