import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProgramBySlug, programs } from "@/data/programs";
import { Breadcrumb } from "@/components/ui";
import { IconCalendar, IconCheck, IconClock, IconUsers } from "@/components/icons";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) return {};
  return {
    title: `${program.title} | متقن`,
    description: program.short,
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

  return (
    <div className="container-page section">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/" },
          { label: "البرامج", href: "/programs" },
          { label: program.title },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <div className="card flex items-center gap-6 overflow-hidden p-8">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gold-light sm:h-28 sm:w-28">
              <svg viewBox="0 0 120 120" className="h-14 w-14 text-gold-dark sm:h-16 sm:w-16">
                <path d="M40 70 L60 30 L80 70" stroke="currentColor" strokeWidth="4" fill="none" />
                <rect x="45" y="35" width="30" height="35" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{program.title}</h1>
              <p className="mt-2 text-ink-soft">{program.short}</p>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="mb-4 text-lg font-extrabold text-ink">عن البرنامج</h2>
            <p className="leading-relaxed text-ink-soft">{program.description}</p>
          </div>

          <div className="card p-8">
            <h2 className="mb-5 text-lg font-extrabold text-ink">مميزات البرنامج</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {program.features.map((f) => (
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
              <span className="text-sm text-ink-soft">يبدأ من</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gold-dark">{program.price}</span>
                <span className="text-sm font-bold text-ink-soft">ريال / شهريًا</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-y border-line py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-soft">
                  <IconClock className="h-4 w-4 text-gold" />
                  مدة الحصة
                </span>
                <span className="font-bold text-ink">{program.sessionMinutes} دقيقة</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-soft">
                  <IconCalendar className="h-4 w-4 text-gold" />
                  عدد الحصص
                </span>
                <span className="font-bold text-ink">{program.sessionsPerWeek} حصص / أسبوعيًا</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-soft">
                  <IconUsers className="h-4 w-4 text-gold" />
                  الفئة العمرية
                </span>
                <span className="font-bold text-ink">{program.ageGroup}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/signup?program=${program.slug}`} className="btn-primary w-full">
                احجز الآن ‹
              </Link>
              <Link href="/contact" className="btn-outline w-full">
                استشارة مجانية
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
