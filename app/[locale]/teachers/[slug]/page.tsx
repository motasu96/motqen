import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTeacherBySlug, Teacher } from "@/data/teachers";
import { Breadcrumb, Rating } from "@/components/ui";
import TeacherProfileTabs from "@/components/TeacherProfileTabs";
import { localize } from "@/lib/localize";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getTeacherBySlugFromDb } from "@/lib/supabase/teachers";

// Teacher data is DB-backed and can change (new approvals), so this route
// renders per-request instead of being baked into the static build.
export const dynamic = "force-dynamic";

async function loadTeacher(slug: string): Promise<Teacher | null> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const dbTeacher = await getTeacherBySlugFromDb(supabase, slug);
      if (dbTeacher) return dbTeacher;
    } catch {
      // fall through to the static fallback below
    }
  }
  return getTeacherBySlug(slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const teacher = await loadTeacher(slug);
  if (!teacher) return {};
  const te = localize(teacher, locale);
  return {
    title: te.name,
    description: te.bio,
  };
}

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await loadTeacher(slug);
  if (!teacher) notFound();

  return <TeacherProfileContent teacher={teacher} />;
}

function TeacherProfileContent({ teacher }: { teacher: Teacher }) {
  const locale = useLocale();
  const t = useTranslations("Teachers");
  const tNav = useTranslations("Nav");
  const te = localize(teacher, locale);

  return (
    <div className="container-page section">
      <Breadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("teachers"), href: "/teachers" },
          { label: te.name },
        ]}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="card flex h-fit flex-col items-center gap-5 p-7 text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full">
            <Image src={teacher.avatarUrl} alt={te.name} fill sizes="112px" className="object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink">{te.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">{te.title}</p>
          </div>
          <Rating value={teacher.stats.rating} />
          <Link href={`/signup?teacher=${teacher.slug}`} className="btn-primary w-full">
            {t("bookSession")}
          </Link>

          <div className="grid w-full grid-cols-2 gap-4 border-t border-line pt-5 text-center">
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.students}</div>
              <div className="text-xs text-ink-soft">{t("statStudents")}</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.yearsExperience}</div>
              <div className="text-xs text-ink-soft">{t("statYears")}</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.completedSessions}</div>
              <div className="text-xs text-ink-soft">{t("statSessions")}</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">{teacher.stats.rating}</div>
              <div className="text-xs text-ink-soft">{t("statRating")}</div>
            </div>
          </div>
        </aside>

        <TeacherProfileTabs teacher={teacher} />
      </div>
    </div>
  );
}
