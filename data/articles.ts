export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "الحفظ" | "التجويد" | "التربية" | "عام";
  date: string;
  readMinutes: number;
};

export const articles: Article[] = [
  {
    slug: "keeping-quran-after-hifz",
    title: "كيف تحافظ على القرآن بعد حفظه؟",
    excerpt: "خطوات عملية ومجربة للحفاظ على المحفوظ من القرآن الكريم وعدم تفلته بعد إتمام الحفظ.",
    category: "الحفظ",
    date: "2024-05-30",
    readMinutes: 6,
  },
  {
    slug: "raising-kids-on-quran",
    title: "تربية الأطفال على حفظ القرآن",
    excerpt: "أساليب تربوية فعالة لغرس حب القرآن الكريم في نفوس الأطفال منذ الصغر.",
    category: "التربية",
    date: "2024-05-18",
    readMinutes: 5,
  },
  {
    slug: "common-tilawa-mistakes",
    title: "أخطاء شائعة في تعلم التلاوة",
    excerpt: "أبرز الأخطاء التي يقع فيها المتعلمون عند تلاوة القرآن الكريم وكيفية تجنبها.",
    category: "التجويد",
    date: "2024-05-10",
    readMinutes: 4,
  },
  {
    slug: "virtue-of-hifz",
    title: "فضل حفظ القرآن وتعلمه",
    excerpt: "نصوص وأحاديث نبوية تبين عظيم أجر من تعلم القرآن الكريم وعلّمه لغيره.",
    category: "عام",
    date: "2024-05-05",
    readMinutes: 3,
  },
  {
    slug: "effective-revision-tips",
    title: "نصائح للمراجعة الفعالة",
    excerpt: "طرق مجربة لتنظيم وقت المراجعة اليومية والأسبوعية لضمان ثبات المحفوظ.",
    category: "الحفظ",
    date: "2024-04-28",
    readMinutes: 5,
  },
  {
    slug: "tajweed-rules-simplified",
    title: "أحكام التجويد المبسطة للمبتدئين",
    excerpt: "شرح ميسّر لأهم أحكام التجويد التي يحتاجها كل متعلم في بداية طريقه.",
    category: "التجويد",
    date: "2024-04-20",
    readMinutes: 7,
  },
];
