import Link from "next/link";
import { teachers } from "@/data/teachers";
import { Breadcrumb, Rating } from "@/components/ui";

export const metadata = { title: "المعلمون | متقن" };

export default function TeachersPage() {
  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "المعلمون" }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">معلمونا ومعلماتنا</h1>
        <p className="max-w-xl text-ink-soft">نخبة من المعلمين والمعلمات المؤهلين شرعيًا وأصحاب الإسناد المتصل.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t) => (
          <Link key={t.slug} href={`/teachers/${t.slug}`} className="card flex flex-col items-center gap-4 p-7 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-light text-2xl font-extrabold text-gold-dark">
              {t.avatarInitial}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-ink">{t.name}</h3>
              <p className="text-sm text-ink-soft">{t.title}</p>
            </div>
            <Rating value={t.stats.rating} />
            <span className="text-xs text-ink-soft">{t.stats.students}+ طالب · {t.stats.yearsExperience}+ سنوات خبرة</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
