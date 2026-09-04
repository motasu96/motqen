import Image from "next/image";
import { Breadcrumb } from "@/components/ui";
import { IconEye, IconHeart, IconAward } from "@/components/icons";

export const metadata = { title: "عن متقن | متقن" };

const CARDS = [
  {
    icon: IconEye,
    title: "رؤيتنا",
    desc: "أن نكون المنصة الرائدة عالميًا في تعليم القرآن الكريم للمسلمين في كل مكان.",
  },
  {
    icon: IconHeart,
    title: "رسالتنا",
    desc: "نشر القرآن الكريم وتعليمه بإتقان وتيسير لكافة المسلمين عبر منصة تعليمية موثوقة.",
  },
  {
    icon: IconAward,
    title: "قيمنا",
    desc: "الإخلاص، الإتقان، الأمانة، والاحترافية في كل حصة تعليمية نقدمها.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "عن متقن" }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <span className="eyebrow">عن متقن</span>
          <h1 className="text-3xl font-extrabold leading-snug text-ink sm:text-4xl">
            منصة تعليمية متخصصة في تعليم القرآن الكريم عن بُعد
          </h1>
          <p className="leading-relaxed text-ink-soft">
            انطلقت مقرأة متقن بهدف تيسير تعليم القرآن الكريم للمسلمين والمسلمات في كل مكان،
            عبر منصة إلكترونية حديثة تجمع بين الانضباط الشرعي والمرونة في التعلم، بإشراف
            نخبة من المعلمين والمعلمات المجازين بالإسناد المتصل، وفي بيئة تعليمية آمنة
            ومحفزة تناسب جميع الأعمار والمستويات.
          </p>
        </div>
        <div className="card relative aspect-[4/3] overflow-hidden p-6">
          <div className="relative h-full w-full">
            <Image
              src="/images/about-illustration.jpg"
              alt="معلم يقدّم حصة تحفيظ عن بُعد عبر الحاسوب"
              fill
              sizes="(min-width: 1024px) 500px, 85vw"
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.title} className="card flex flex-col items-center gap-3 p-7 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
              <c.icon className="h-7 w-7 text-gold-dark" />
            </div>
            <h3 className="text-base font-extrabold text-ink">{c.title}</h3>
            <p className="text-sm leading-relaxed text-ink-soft">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
