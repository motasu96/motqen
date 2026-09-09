export type ProgramTranslation = {
  title: string;
  short: string;
  description: string;
  ageGroup: string;
  features: string[];
};

export type Program = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: "quran" | "tilawa" | "review" | "kids" | "family" | "women" | "qiraat";
  image: string;
  category: "children" | "adults" | "women" | "all";
  featured?: boolean;
  price: number;
  sessionMinutes: number;
  sessionsPerWeek: number;
  ageGroup: string;
  features: string[];
  en: ProgramTranslation;
};

export const programs: Program[] = [
  {
    slug: "hifz-mutqan",
    image: "/images/prog-hifz.jpg",
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
    en: {
      title: "Mastery Memorization",
      short: "Memorize the Holy Quran with a precise plan and continuous follow-up",
      description:
        "An interactive program designed to memorize the Book of Allah according to a well-structured plan that considers the student's level, with daily teacher follow-up and periodic tests that ensure the memorization is solid and mastered.",
      ageGroup: "6 years and up",
      features: [
        "A memorization plan tailored to each student",
        "Daily follow-up from the teacher",
        "Periodic tests and reviews",
        "Continuous reports for parents",
        "A certificate upon completing each juz'",
      ],
    },
  },
  {
    slug: "tilawa-tajweed",
    image: "/images/prog-tilawa.jpg",
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
    en: {
      title: "Recitation & Tajweed",
      short: "Learn correct recitation and the rules of Tajweed",
      description:
        "A specialized program to correct recitation and master the theoretical and practical rules of Tajweed, supervised by teachers holding certified licenses (Ijazahs) in the Quranic readings.",
      ageGroup: "All ages",
      features: [
        "Correcting letter articulation points",
        "Tajweed rules, theory and practice",
        "Live vocal training",
        "Precise individual follow-up",
      ],
    },
  },
  {
    slug: "muraja-hifz",
    image: "/images/prog-muraja.jpg",
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
    en: {
      title: "Review & Retention",
      short: "Specialized programs for reviewing and retaining memorization",
      description:
        "A program designed for those who have completed memorizing the Quran, or part of it, and want to preserve it, through an organized periodic review plan that prevents forgetting and reinforces what has been memorized.",
      ageGroup: "All ages",
      features: [
        "An organized periodic review plan",
        "Specialized supervision for retention",
        "Weekly performance reports",
        "Flexibility in choosing the daily amount",
      ],
    },
  },
  {
    slug: "bara-em-mutqin",
    image: "/images/prog-kids.jpg",
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
    en: {
      title: "Motqen Kids",
      short: "Educational programs for children with fun, interactive methods",
      description:
        "A program dedicated to children that combines memorizing the Quran with learning its manners through interactive, motivating methods, in a safe environment that accounts for each child's age differences.",
      ageGroup: "4 to 12 years old",
      features: [
        "Fun, interactive teaching methods",
        "Female teachers specialized in child education",
        "Badges and continuous motivation",
        "Daily reports for parents",
      ],
    },
  },
  {
    slug: "qiraat-ashr",
    image: "/images/prog-qiraat.jpg",
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
    en: {
      title: "The Ten Readings",
      short: "Learn the Ten Readings (Qira'at) with a connected chain of transmission",
      description:
        "An advanced program for students of the Ten Readings that prepares the student to obtain a connected-chain Ijazah, supervised by sheikhs specialized in the science of Qira'at.",
      ageGroup: "For those who have memorized the Quran",
      features: [
        "Studying the minor and major Ten Readings",
        "Connected-chain Ijazah",
        "Sheikhs specialized in the science of Qira'at",
        "Flexible timing for licensed reciters",
      ],
    },
  },
  {
    slug: "barnamej-nisaa",
    image: "/images/prog-nisaa.jpg",
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
    en: {
      title: "Women's Programs",
      short: "Dedicated programs for women with complete privacy",
      description:
        "Comprehensive educational programs (memorization, recitation, Tajweed) dedicated to women, fully supervised by masterful female teachers and in complete privacy suited to their needs.",
      ageGroup: "A program dedicated to women",
      features: [
        "Masterful female teachers only",
        "Complete privacy in sessions",
        "Flexible plans that fit a woman's schedule",
        "All tracks: memorization, recitation, review",
      ],
    },
  },
];

export function getProgramBySlug(slug: string) {
  return programs.find((p) => p.slug === slug);
}
