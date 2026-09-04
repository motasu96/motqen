export type Program = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: "quran" | "tilawa" | "review" | "kids" | "family" | "women" | "qiraat";
  category: "children" | "adults" | "women" | "all";
  featured?: boolean;
  price: number;
  sessionMinutes: number;
  sessionsPerWeek: number;
  ageGroup: string;
  features: string[];
};

export const programs: Program[] = [
  {
    slug: "hifz-mutqan",
    title: "الحفظ المتقن",
    short: "حفظ القرآن الكريم بخطة متقنة ومتابعة مستمرة",
    description:
      "برنامج تفاعلي مصمم لحفظ كتاب الله وفق خطة محكمة تراعي مستوى الطالب، بمتابعة يومية من المعلم واختبارات دورية تضمن رسوخ الحفظ وإتقانه.",
    icon: "quran",
    category: "all",
    featured: true,
    price: 450,
    sessionMinutes: 45,
    sessionsPerWeek: 5,
    ageGroup: "من 6 سنوات فما فوق",
    features: [
      "خطة حفظ مخصصة لكل طالب",
      "متابعة يومية من المعلم",
      "اختبارات ومراجعات دورية",
      "تقارير مستمرة لأولياء الأمور",
      "شهادة عند إتمام كل جزء",
    ],
  },
  {
    slug: "tilawa-tajweed",
    title: "التلاوة والتجويد",
    short: "تعلم القراءة الصحيحة وأحكام التجويد",
    description:
      "برنامج متخصص لتصحيح التلاوة وإتقان أحكام التجويد النظرية والتطبيقية، بإشراف معلمين حاصلين على إجازات معتمدة في القراءات.",
    icon: "tilawa",
    category: "all",
    price: 380,
    sessionMinutes: 40,
    sessionsPerWeek: 3,
    ageGroup: "جميع الأعمار",
    features: [
      "تصحيح مخارج الحروف",
      "أحكام التجويد نظريًا وتطبيقيًا",
      "تدريب صوتي مباشر",
      "متابعة فردية دقيقة",
    ],
  },
  {
    slug: "muraja-hifz",
    title: "المراجعة والحفظ",
    short: "برامج مخصصة للمراجعة والحفظ بإشراف متخصص",
    description:
      "برنامج مصمم لمن أتم حفظ القرآن أو جزء منه ويريد المحافظة عليه، عبر خطة مراجعة دورية منظمة تمنع التفلت وتثبت المحفوظ.",
    icon: "review",
    category: "all",
    price: 350,
    sessionMinutes: 40,
    sessionsPerWeek: 4,
    ageGroup: "جميع الأعمار",
    features: [
      "خطة مراجعة دورية منظمة",
      "إشراف متخصص على التثبيت",
      "تقارير أداء أسبوعية",
      "مرونة في اختيار المقدار اليومي",
    ],
  },
  {
    slug: "bara-em-mutqin",
    title: "براعم متقن",
    short: "برامج تعليمية للأطفال بأساليب ممتعة وتفاعلية",
    description:
      "برنامج خاص بالأطفال يجمع بين حفظ القرآن وتعلم آدابه بأساليب تفاعلية ومحفزة، في بيئة آمنة تراعي الفروق العمرية لكل طفل.",
    icon: "kids",
    category: "children",
    price: 320,
    sessionMinutes: 30,
    sessionsPerWeek: 4,
    ageGroup: "من 4 إلى 12 سنة",
    features: [
      "أساليب تعليمية ممتعة وتفاعلية",
      "معلمات متخصصات في تعليم الأطفال",
      "شارات وتحفيز مستمر",
      "تقارير يومية لولي الأمر",
    ],
  },
  {
    slug: "qiraat-ashr",
    title: "القراءات العشر",
    short: "تعلم القراءات العشر وإجازاتها المتصلة السند",
    description:
      "برنامج متقدم لدارسي القراءات العشر يؤهل الطالب لأخذ الإجازة المتصلة السند بإشراف مشايخ متخصصين في علم القراءات.",
    icon: "qiraat",
    category: "adults",
    price: 500,
    sessionMinutes: 60,
    sessionsPerWeek: 3,
    ageGroup: "لحفظة القرآن الكريم",
    features: [
      "دراسة القراءات العشر الصغرى والكبرى",
      "إجازة متصلة السند",
      "مشايخ متخصصون في علم القراءات",
      "مواعيد مرنة تناسب المجازين",
    ],
  },
  {
    slug: "barnamej-nisaa",
    title: "برامج النساء",
    short: "برامج خاصة للنساء بخصوصية تامة",
    description:
      "برامج تعليمية شاملة (حفظ، تلاوة، تجويد) مخصصة للنساء، بإشراف كامل من معلمات متقنات وفي خصوصية تامة تناسب احتياجاتهن.",
    icon: "women",
    category: "women",
    price: 400,
    sessionMinutes: 40,
    sessionsPerWeek: 4,
    ageGroup: "برنامج خاص بالنساء",
    features: [
      "معلمات متقنات فقط",
      "خصوصية تامة في الحصص",
      "خطط مرنة تناسب انشغال المرأة",
      "جميع المسارات: حفظ، تلاوة، مراجعة",
    ],
  },
];

export function getProgramBySlug(slug: string) {
  return programs.find((p) => p.slug === slug);
}
