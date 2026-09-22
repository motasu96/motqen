import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Breadcrumb, Rating } from "@/components/ui";
import { IconTeacherBadge } from "@/components/icons";
import { localize } from "@/lib/localize";
import { createClient } from "@/lib/supabase/server";
import { getActiveTeachers } from "@/lib/supabase/teachers";

// Teacher data is DB-backed and can change (new approvals), so this route
// renders per-request instead of being baked into the static build.
export const dynamic = "force-dynamic";

async function loadTeachers() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = await createClient();
    return await getActiveTeachers(supabase);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Teachers" });
  return { title: t("metaTitle") };
}

export default async function TeachersPage() {
  const teachers = await loadTeachers();
  return <TeachersPageContent teachers={teachers} />;
}

function TeachersPageContent({ teachers }: { teachers: Awaited<ReturnType<typeof loadTeachers>> }) {
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

      {teachers.length === 0 ? (
        <div className="card mt-10 flex flex-col items-center gap-2 p-10 text-center">
          <IconTeacherBadge className="h-8 w-8 text-gold-dark" aria-hidden="true" />
          <h3 className="text-base font-extrabold text-ink">{t("noTeachersTitle")}</h3>
          <p className="text-sm text-ink-soft">{t("noTeachersDesc")}</p>
        </div>
      ) : (
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
      )}

      <div className="card mt-12 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-start">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light">
            <IconTeacherBadge className="h-6 w-6 text-gold-dark" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-ink">{t("ctaTitle")}</h3>
            <p className="text-sm text-ink-soft">{t("ctaDesc")}</p>
          </div>
        </div>
        <Link href="/join-as-teacher" className="btn-primary shrink-0">
          {t("ctaButton")}
        </Link>
      </div>
    </div>
  );
}
