import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getTeacherBySlug, teachers } from "@/data/teachers";
import { Breadcrumb, Rating } from "@/components/ui";
import TeacherProfileTabs from "@/components/TeacherProfileTabs";

export function generateStaticParams() {
  return teachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const teacher = getTeacherBySlug(slug);
  if (!teacher) return {};
  return {
    title: `${teacher.name} | متقن`,
    description: teacher.bio,
  };
}

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = getTeacherBySlug(slug);
  if (!teacher) notFound();

  return (
    <div className="container-page section">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "المعلمون", href: "/teachers" },
          { label: teacher.name },
        ]}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="card flex h-fit flex-col items-center gap-5 p-7 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gold-light text-4xl font-extrabold text-gold-dark" aria-hidden="true">
            {teacher.avatarInitial}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink">{teacher.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">{teacher.title}</p>
          </div>
          <Rating value={teacher.stats.rating} />
          <Link href={`/signup?teacher=${teacher.slug}`} className="btn-primary w-full">
            احجز حصة معه
          </Link>

          <div className="grid w-full grid-cols-2 gap-4 border-t border-line pt-5 text-center">
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.students}</div>
              <div className="text-xs text-ink-soft">طالب</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.yearsExperience}</div>
              <div className="text-xs text-ink-soft">سنوات خبرة</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">+{teacher.stats.completedSessions}</div>
              <div className="text-xs text-ink-soft">حصة مكتملة</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-gold-dark">{teacher.stats.rating}</div>
              <div className="text-xs text-ink-soft">تقييم الطلاب</div>
            </div>
          </div>
        </aside>

        <TeacherProfileTabs teacher={teacher} />
      </div>
    </div>
  );
}
