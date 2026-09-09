export type Review = {
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type TeacherTranslation = {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
};

export type Teacher = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  gender: "male" | "female";
  stats: {
    students: number;
    yearsExperience: number;
    completedSessions: number;
    rating: number;
  };
  specialties: string[];
  reviews: Review[];
  en: TeacherTranslation;
};

export const teachers: Teacher[] = [
  {
    slug: "abdullah-alsalmi",
    name: "أ. عبدالله السلمي",
    title: "معلم قرآن كريم",
    bio: "معلم قرآن كريم بخبرة تزيد عن 10 سنوات في مجال تعليم القرآن الكريم والتجويد، لديه إسناد متصل وعمل بمعظم المنابر التعليمية المعتمدة.",
    avatarUrl: "/images/teacher-male.jpg",
    gender: "male",
    stats: { students: 1200, yearsExperience: 10, completedSessions: 4500, rating: 4.9 },
    specialties: ["التحفيظ", "التجويد", "التلاوة", "المراجعة"],
    reviews: [
      {
        name: "أحمد محمد",
        rating: 5,
        comment: "معلم متمكن وصبور جدًا مع الأطفال، ابني تحسن كثيرًا في التلاوة خلال أشهر قليلة.",
        date: "2024-05-10",
      },
      {
        name: "سلطان عبدالله",
        rating: 5,
        comment: "أسلوب تدريس رائع ومتابعة مستمرة، أنصح به بشدة.",
        date: "2024-04-22",
      },
      {
        name: "منى العتيبي",
        rating: 4,
        comment: "معلم ملتزم بالمواعيد ويشرح بطريقة مبسطة.",
        date: "2024-03-15",
      },
    ],
    en: {
      name: "Ust. Abdullah Al-Salmi",
      title: "Quran Teacher",
      bio: "A Quran teacher with over 10 years of experience in teaching the Holy Quran and Tajweed, holding a connected chain of transmission (Ijazah) and having worked with most accredited teaching platforms.",
      specialties: ["Memorization", "Tajweed", "Recitation", "Review"],
    },
  },
  {
    slug: "fatima-alzahrani",
    name: "أ. فاطمة الزهراني",
    title: "معلمة قرآن كريم",
    bio: "معلمة متخصصة في تعليم القرآن الكريم للنساء والأطفال، حاصلة على إجازة في القراءات العشر وخبرة 8 سنوات في التحفيظ عن بُعد.",
    avatarUrl: "/images/teacher-female.jpg",
    gender: "female",
    stats: { students: 950, yearsExperience: 8, completedSessions: 3200, rating: 4.8 },
    specialties: ["برامج النساء", "براعم متقن", "التجويد"],
    reviews: [
      {
        name: "نورة القحطاني",
        rating: 5,
        comment: "معلمة متميزة وأسلوبها مريح جدًا في الحصص.",
        date: "2024-05-02",
      },
      {
        name: "هند السبيعي",
        rating: 5,
        comment: "بناتي يحبون حصصهم معها كثيرًا، جزاها الله خيرًا.",
        date: "2024-04-11",
      },
    ],
    en: {
      name: "Ust. Fatima Al-Zahrani",
      title: "Quran Teacher",
      bio: "A teacher specialized in teaching the Holy Quran to women and children, holding an Ijazah in the Ten Readings and with 8 years of experience in remote memorization instruction.",
      specialties: ["Women's Programs", "Motqen Kids", "Tajweed"],
    },
  },
];

export function getTeacherBySlug(slug: string) {
  return teachers.find((t) => t.slug === slug);
}
