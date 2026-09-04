import Link from "next/link";
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

const FEATURES = [
  {
    icon: IconShield,
    title: "بيئة تربوية آمنة",
    desc: "بيئة تعليمية محفزة وآمنة للجميع",
  },
  {
    icon: IconCalendar,
    title: "مرونة في التعلم",
    desc: "اختر الوقت والمكان المناسب لتعلمك",
  },
  {
    icon: IconTeacherBadge,
    title: "معلمون متقنون",
    desc: "نخبة من المعلمين المؤهلين شرعيًا",
  },
  {
    icon: IconPlay,
    title: "تعليم تفاعلي",
    desc: "حصص مباشرة تفاعلية مع المعلم",
  },
];

const STATS = [
  { value: "+1000", label: "حصة تفاعلية يوميًا" },
  { value: "+30", label: "دولة حول العالم" },
  { value: "+150", label: "معلم ومعلمة متقن" },
  { value: "+1500", label: "طالب وطالبة" },
];

const VALUES = [
  {
    icon: IconTarget,
    title: "هدفنا",
    desc: "الإتقان لكل مسلم أن يتعلم القرآن الكريم بيسر وتدبر.",
  },
  {
    icon: IconEye,
    title: "رؤيتنا",
    desc: "أن نكون المنصة الرائدة عالميًا في تعليم القرآن الكريم.",
  },
  {
    icon: IconHeart,
    title: "رسالتنا",
    desc: "نشر القرآن الكريم وتعليمه بإتقان وتيسير لكافة المسلمين.",
  },
  {
    icon: IconAward,
    title: "قيمنا",
    desc: "الإخلاص، الإتقان، الأمانة، والاحترافية في كل حصة.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-up order-2 flex flex-col items-start gap-6 lg:order-1">
            <Eyebrow>مقرأة متقن.. حيث يصبح القرآن رفيق دربك</Eyebrow>
            <h1 className="text-4xl font-extrabold leading-[1.25] text-ink sm:text-5xl md:text-6xl">
              تعلم القرآن
              <br />
              بإتقان و<span className="text-gold-dark">تدبر</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              منصة تعليمية إلكترونية متخصصة في تعليم القرآن الكريم عن بُعد،
              بإشراف نخبة من المعلمين والمعلمات.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup" className="btn-primary">
                ابدأ رحلتك الآن ‹
              </Link>
              <Link href="/programs" className="btn-outline">
                <IconPlay className="h-4 w-4" />
                استكشف البرامج
              </Link>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-light">
                <IconAward className="h-6 w-6 text-gold-dark" />
              </div>
              <span className="text-sm font-bold text-ink-soft">
                شهادات
                <br />
                موثقة معتمدة
              </span>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative flex aspect-square w-full max-w-md items-center justify-center rounded-card-lg bg-card shadow-soft">
              <div className="flex h-52 w-52 items-center justify-center rounded-full border border-line/70 bg-bg sm:h-64 sm:w-64">
                <svg viewBox="0 0 120 120" className="h-32 w-32 text-gold-dark sm:h-40 sm:w-40">
                  <rect x="35" y="70" width="50" height="6" rx="2" fill="currentColor" opacity="0.5" />
                  <path d="M40 70 L60 30 L80 70" stroke="currentColor" strokeWidth="4" fill="none" />
                  <rect x="45" y="35" width="30" height="35" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-2xl border border-line bg-card px-3 py-2 shadow-soft sm:right-6 sm:top-6">
                <IconPlay className="h-5 w-5 text-gold-dark" />
                <span className="text-xs font-bold text-ink">تعليم تفاعلي لأطفالك</span>
              </div>
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
          <SectionHeading eyebrow="برامجنا التعليمية" title="برامج متنوعة تناسب جميع الأعمار والمستويات" />
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
            <p className="max-w-2xl text-xl font-extrabold leading-relaxed text-ink sm:text-2xl">
              خيركم من تعلم القرآن وعلمه
            </p>
            <span className="text-sm text-ink-soft">— رواه البخاري</span>
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
