export type LessonRecord = {
  id: string;
  date: string;
  time: string;
  teacher: string;
  surah: string;
  range: string;
  status: "مكتملة" | "قادمة" | "ملغاة";
  en: { time: string; teacher: string; surah: string; range: string };
};

export const lessons: LessonRecord[] = [
  {
    id: "session-ahmed-abdullah",
    date: "2026-09-06",
    time: "5:30 م",
    teacher: "أ. عبدالله السلمي",
    surah: "سورة البقرة",
    range: "من 120 إلى 145",
    status: "قادمة",
    en: { time: "5:30 PM", teacher: "Ust. Abdullah Al-Salmi", surah: "Surah Al-Baqarah", range: "Verses 120–145" },
  },
  {
    id: "l2",
    date: "2026-08-30",
    time: "5:30 م",
    teacher: "أ. عبدالله السلمي",
    surah: "سورة البقرة",
    range: "من 95 إلى 120",
    status: "مكتملة",
    en: { time: "5:30 PM", teacher: "Ust. Abdullah Al-Salmi", surah: "Surah Al-Baqarah", range: "Verses 95–120" },
  },
  {
    id: "l3",
    date: "2026-08-23",
    time: "5:30 م",
    teacher: "أ. عبدالله السلمي",
    surah: "سورة البقرة",
    range: "من 70 إلى 95",
    status: "مكتملة",
    en: { time: "5:30 PM", teacher: "Ust. Abdullah Al-Salmi", surah: "Surah Al-Baqarah", range: "Verses 70–95" },
  },
  {
    id: "l4",
    date: "2026-08-16",
    time: "5:30 م",
    teacher: "أ. عبدالله السلمي",
    surah: "سورة البقرة",
    range: "من 40 إلى 70",
    status: "مكتملة",
    en: { time: "5:30 PM", teacher: "Ust. Abdullah Al-Salmi", surah: "Surah Al-Baqarah", range: "Verses 40–70" },
  },
  {
    id: "l5",
    date: "2026-08-09",
    time: "5:30 م",
    teacher: "أ. عبدالله السلمي",
    surah: "سورة البقرة",
    range: "من 1 إلى 40",
    status: "ملغاة",
    en: { time: "5:30 PM", teacher: "Ust. Abdullah Al-Salmi", surah: "Surah Al-Baqarah", range: "Verses 1–40" },
  },
];

export type HomeworkItem = {
  id: string;
  title: string;
  type: "تسميع" | "مراجعة" | "تجويد";
  dueDate: string;
  status: "بانتظار التسليم" | "تم التسليم" | "تم التصحيح";
  grade?: string;
  en: { title: string };
};

export const homework: HomeworkItem[] = [
  {
    id: "h1",
    title: "تسميع الآيات 120 إلى 145",
    type: "تسميع",
    dueDate: "2026-09-06",
    status: "بانتظار التسليم",
    en: { title: "Recite verses 120 to 145" },
  },
  {
    id: "h2",
    title: "مراجعة سورة البقرة من 100 إلى 120",
    type: "مراجعة",
    dueDate: "2026-09-03",
    status: "تم التسليم",
    en: { title: "Review Surah Al-Baqarah verses 100 to 120" },
  },
  {
    id: "h3",
    title: "تطبيق أحكام المد في سورة البقرة",
    type: "تجويد",
    dueDate: "2026-08-28",
    status: "تم التصحيح",
    grade: "9.5 / 10",
    en: { title: "Apply the rules of elongation (madd) in Surah Al-Baqarah" },
  },
  {
    id: "h4",
    title: "تسميع الآيات 70 إلى 95",
    type: "تسميع",
    dueDate: "2026-08-23",
    status: "تم التصحيح",
    grade: "9 / 10",
    en: { title: "Recite verses 70 to 95" },
  },
];

export type ExamRecord = {
  id: string;
  title: string;
  date: string;
  status: "قادم" | "مكتمل";
  score?: number;
  maxScore?: number;
  en: { title: string };
};

export const exams: ExamRecord[] = [
  {
    id: "e1",
    title: "اختبار الجزء الأول — نصف الحفظ",
    date: "2026-09-15",
    status: "قادم",
    en: { title: "First Juz' Exam — Half of Memorization" },
  },
  {
    id: "e2",
    title: "اختبار شهري — سورة البقرة (1-100)",
    date: "2026-08-20",
    status: "مكتمل",
    score: 92,
    maxScore: 100,
    en: { title: "Monthly Exam — Surah Al-Baqarah (1-100)" },
  },
  {
    id: "e3",
    title: "اختبار تجويد — أحكام النون الساكنة",
    date: "2026-07-18",
    status: "مكتمل",
    score: 88,
    maxScore: 100,
    en: { title: "Tajweed Exam — Rules of the Silent Noon" },
  },
];

export type ArchiveItem = {
  id: string;
  surah: string;
  juz: string;
  completedDate: string;
  pages: number;
  en: { surah: string; juz: string };
};

export const archive: ArchiveItem[] = [
  {
    id: "a1",
    surah: "سورة الفاتحة",
    juz: "الجزء 1",
    completedDate: "2025-11-02",
    pages: 1,
    en: { surah: "Surah Al-Fatiha", juz: "Juz' 1" },
  },
  {
    id: "a2",
    surah: "جزء عمّ (30)",
    juz: "الجزء 30",
    completedDate: "2025-12-20",
    pages: 22,
    en: { surah: "Juz' Amma (30)", juz: "Juz' 30" },
  },
  {
    id: "a3",
    surah: "جزء تبارك (29)",
    juz: "الجزء 29",
    completedDate: "2026-03-05",
    pages: 22,
    en: { surah: "Juz' Tabarak (29)", juz: "Juz' 29" },
  },
  {
    id: "a4",
    surah: "سورة البقرة (1-95)",
    juz: "الجزء 1-2",
    completedDate: "2026-08-30",
    pages: 18,
    en: { surah: "Surah Al-Baqarah (1-95)", juz: "Juz' 1-2" },
  },
];

export type Notice = {
  id: string;
  title: string;
  body: string;
  date: string;
  en: { title: string; body: string };
};

export const studentNotices: Notice[] = [
  {
    id: "n1",
    title: "إجازة نهاية الفصل الدراسي",
    body: "تعلن مقرأة متقن عن إجازة الحصص من 20 إلى 25 سبتمبر، وستُستأنف الحصص بعدها حسب الجدول المعتاد.",
    date: "2026-09-01",
    en: {
      title: "End of Term Break",
      body: "Motqen Quran Academy announces a session break from September 20 to 25; sessions will resume afterward according to the usual schedule.",
    },
  },
  {
    id: "n2",
    title: "تحديث نظام الشارات",
    body: "تم إطلاق نظام شارات جديد لتحفيز الطلاب على الحفظ والمراجعة المستمرة، تحقق من صفحتك الرئيسية.",
    date: "2026-08-22",
    en: {
      title: "Badge System Update",
      body: "A new badge system has been launched to motivate students toward continuous memorization and review; check your home page.",
    },
  },
  {
    id: "n3",
    title: "تذكير بموعد الاختبار الشهري",
    body: "نذكّر جميع الطلاب بموعد الاختبار الشهري القادم، يرجى مراجعة المقرر المحدد مسبقًا.",
    date: "2026-08-15",
    en: {
      title: "Reminder: Monthly Exam Date",
      body: "We remind all students of the upcoming monthly exam date; please review the previously assigned material.",
    },
  },
];

export const teacherNotices: Notice[] = [
  {
    id: "tn1",
    title: "اجتماع المعلمين الشهري",
    body: "يُعقد الاجتماع الشهري للمعلمين والمعلمات يوم الخميس القادم الساعة 8 مساءً عبر الاتصال المرئي.",
    date: "2026-09-02",
    en: {
      title: "Monthly Teachers Meeting",
      body: "The monthly meeting for teachers will be held next Thursday at 8 PM via video call.",
    },
  },
  {
    id: "tn2",
    title: "تحديث سياسة تقييم الواجبات",
    body: "تم تحديث معايير تقييم الواجبات الصوتية، يرجى الاطلاع على الدليل المرفق في لوحة التحكم.",
    date: "2026-08-25",
    en: {
      title: "Homework Grading Policy Update",
      body: "The criteria for grading voice homework have been updated; please review the attached guide in the dashboard.",
    },
  },
  {
    id: "tn3",
    title: "فتح التسجيل لدورة تدريبية",
    body: 'تم فتح التسجيل في دورة "أساليب تحفيظ الأطفال" المجانية للمعلمين والمعلمات هذا الشهر.',
    date: "2026-08-10",
    en: {
      title: "Registration Open for a Training Course",
      body: 'Registration is now open for the free "Child Memorization Methods" course for teachers this month.',
    },
  },
];

export type TeacherStudent = {
  id: string;
  name: string;
  program: string;
  progress: number;
  lastSession: string;
  status: "منتظم" | "متأخر" | "متعثر";
  en: { name: string; program: string };
};

export const teacherStudents: TeacherStudent[] = [
  { id: "s1", name: "أحمد محمد", program: "الحفظ المتقن", progress: 68, lastSession: "2026-08-30", status: "منتظم", en: { name: "Ahmed Mohammed", program: "Mastery Memorization" } },
  { id: "s2", name: "عبدالرحمن خالد", program: "الحفظ المتقن", progress: 41, lastSession: "2026-08-19", status: "متأخر", en: { name: "Abdulrahman Khaled", program: "Mastery Memorization" } },
  { id: "s3", name: "يوسف باشا", program: "التلاوة والتجويد", progress: 77, lastSession: "2026-08-28", status: "منتظم", en: { name: "Yousef Basha", program: "Recitation & Tajweed" } },
  { id: "s4", name: "محمد ياسر", program: "المراجعة والحفظ", progress: 22, lastSession: "2026-08-10", status: "متعثر", en: { name: "Mohammed Yasser", program: "Review & Retention" } },
  { id: "s5", name: "سلطان عبدالله", program: "الحفظ المتقن", progress: 85, lastSession: "2026-08-31", status: "منتظم", en: { name: "Sultan Abdullah", program: "Mastery Memorization" } },
];

export type ScheduleSlot = {
  id: string;
  day: string;
  time: string;
  student: string;
  program: string;
  en: { time: string; student: string; program: string };
};

export const teacherSchedule: ScheduleSlot[] = [
  { id: "session-ahmed-abdullah", day: "الأحد", time: "5:30 م", student: "أحمد محمد", program: "الحفظ المتقن", en: { time: "5:30 PM", student: "Ahmed Mohammed", program: "Mastery Memorization" } },
  { id: "sc2", day: "السبت", time: "5:30 م", student: "سلطان عبدالله", program: "الحفظ المتقن", en: { time: "5:30 PM", student: "Sultan Abdullah", program: "Mastery Memorization" } },
  { id: "sc3", day: "الأحد", time: "4:00 م", student: "يوسف باشا", program: "التلاوة والتجويد", en: { time: "4:00 PM", student: "Yousef Basha", program: "Recitation & Tajweed" } },
  { id: "sc4", day: "الاثنين", time: "7:00 م", student: "عبدالرحمن خالد", program: "الحفظ المتقن", en: { time: "7:00 PM", student: "Abdulrahman Khaled", program: "Mastery Memorization" } },
  { id: "sc5", day: "الثلاثاء", time: "5:30 م", student: "محمد ياسر", program: "المراجعة والحفظ", en: { time: "5:30 PM", student: "Mohammed Yasser", program: "Review & Retention" } },
  { id: "sc6", day: "الأربعاء", time: "8:30 م", student: "أحمد محمد", program: "الحفظ المتقن", en: { time: "8:30 PM", student: "Ahmed Mohammed", program: "Mastery Memorization" } },
];

export type TeacherHomeworkReview = {
  id: string;
  student: string;
  title: string;
  submittedDate: string;
  status: "بانتظار المراجعة" | "تمت المراجعة";
  grade?: string;
  en: { student: string; title: string };
};

export const teacherHomeworkReviews: TeacherHomeworkReview[] = [
  { id: "th1", student: "أحمد محمد", title: "تسميع الآيات 120 إلى 145", submittedDate: "2026-09-01", status: "بانتظار المراجعة", en: { student: "Ahmed Mohammed", title: "Recite verses 120 to 145" } },
  { id: "th2", student: "يوسف باشا", title: "تطبيق أحكام التجويد — سورة يس", submittedDate: "2026-09-01", status: "بانتظار المراجعة", en: { student: "Yousef Basha", title: "Applying Tajweed rules — Surah Yasin" } },
  { id: "th3", student: "سلطان عبدالله", title: "مراجعة جزء عمّ كاملًا", submittedDate: "2026-08-31", status: "بانتظار المراجعة", en: { student: "Sultan Abdullah", title: "Reviewing all of Juz' Amma" } },
  { id: "th4", student: "عبدالرحمن خالد", title: "تسميع الآيات 40 إلى 70", submittedDate: "2026-08-29", status: "تمت المراجعة", grade: "8.5 / 10", en: { student: "Abdulrahman Khaled", title: "Recite verses 40 to 70" } },
  { id: "th5", student: "محمد ياسر", title: "مراجعة سورة الملك", submittedDate: "2026-08-27", status: "تمت المراجعة", grade: "7 / 10", en: { student: "Mohammed Yasser", title: "Reviewing Surah Al-Mulk" } },
];

export type PlatformStat = {
  label: string;
  value: string;
  delta?: string;
  en: { label: string; value: string; delta?: string };
};

export const platformStats: PlatformStat[] = [
  { label: "إجمالي الطلاب", value: "2,480", delta: "+12% عن الشهر الماضي", en: { label: "Total Students", value: "2,480", delta: "+12% from last month" } },
  { label: "إجمالي المعلمين", value: "34", delta: "+3 معلمين جدد", en: { label: "Total Teachers", value: "34", delta: "+3 new teachers" } },
  { label: "البرامج النشطة", value: "6", en: { label: "Active Programs", value: "6" } },
  { label: "الإيرادات الشهرية", value: "412,500 ر.س", delta: "+8% عن الشهر الماضي", en: { label: "Monthly Revenue", value: "412,500 SAR", delta: "+8% from last month" } },
];

export type AdminTeacher = {
  id: string;
  name: string;
  specialty: string;
  students: number;
  rating: number;
  status: "نشط" | "موقوف" | "قيد المراجعة";
  joinDate: string;
  en: { name: string; specialty: string };
};

export const adminTeachers: AdminTeacher[] = [
  { id: "at1", name: "أ. عبدالله السلمي", specialty: "التحفيظ والتجويد", students: 1200, rating: 4.9, status: "نشط", joinDate: "2019-03-12", en: { name: "Ust. Abdullah Al-Salmi", specialty: "Memorization & Tajweed" } },
  { id: "at2", name: "أ. فاطمة الزهراني", specialty: "برامج النساء والأطفال", students: 950, rating: 4.8, status: "نشط", joinDate: "2020-07-01", en: { name: "Ust. Fatima Al-Zahrani", specialty: "Women's & Children's Programs" } },
  { id: "at3", name: "أ. خالد المطيري", specialty: "القراءات العشر", students: 180, rating: 4.7, status: "نشط", joinDate: "2021-01-20", en: { name: "Ust. Khalid Al-Mutairi", specialty: "The Ten Readings" } },
  { id: "at4", name: "أ. سارة الحربي", specialty: "براعم متقن", students: 410, rating: 4.6, status: "نشط", joinDate: "2021-09-15", en: { name: "Ust. Sarah Al-Harbi", specialty: "Motqen Kids" } },
  { id: "at5", name: "أ. ماجد القحطاني", specialty: "المراجعة والحفظ", students: 260, rating: 4.5, status: "قيد المراجعة", joinDate: "2026-08-01", en: { name: "Ust. Majed Al-Qahtani", specialty: "Review & Retention" } },
  { id: "at6", name: "أ. نورة العتيبي", specialty: "التلاوة والتجويد", students: 95, rating: 4.9, status: "موقوف", joinDate: "2022-02-10", en: { name: "Ust. Noura Al-Otaibi", specialty: "Recitation & Tajweed" } },
];

export type AdminStudent = {
  id: string;
  name: string;
  program: string;
  teacher: string;
  progress: number;
  status: "منتظم" | "متأخر" | "متعثر";
  joinDate: string;
  en: { name: string; program: string; teacher: string };
};

export const adminStudents: AdminStudent[] = [
  { id: "as1", name: "أحمد محمد", program: "الحفظ المتقن", teacher: "أ. عبدالله السلمي", progress: 68, status: "منتظم", joinDate: "2025-10-02", en: { name: "Ahmed Mohammed", program: "Mastery Memorization", teacher: "Ust. Abdullah Al-Salmi" } },
  { id: "as2", name: "عبدالرحمن خالد", program: "الحفظ المتقن", teacher: "أ. عبدالله السلمي", progress: 41, status: "متأخر", joinDate: "2025-11-19", en: { name: "Abdulrahman Khaled", program: "Mastery Memorization", teacher: "Ust. Abdullah Al-Salmi" } },
  { id: "as3", name: "يوسف باشا", program: "التلاوة والتجويد", teacher: "أ. نورة العتيبي", progress: 77, status: "منتظم", joinDate: "2025-09-05", en: { name: "Yousef Basha", program: "Recitation & Tajweed", teacher: "Ust. Noura Al-Otaibi" } },
  { id: "as4", name: "محمد ياسر", program: "المراجعة والحفظ", teacher: "أ. ماجد القحطاني", progress: 22, status: "متعثر", joinDate: "2026-01-14", en: { name: "Mohammed Yasser", program: "Review & Retention", teacher: "Ust. Majed Al-Qahtani" } },
  { id: "as5", name: "سلطان عبدالله", program: "الحفظ المتقن", teacher: "أ. عبدالله السلمي", progress: 85, status: "منتظم", joinDate: "2025-08-30", en: { name: "Sultan Abdullah", program: "Mastery Memorization", teacher: "Ust. Abdullah Al-Salmi" } },
  { id: "as6", name: "نورة القحطاني", program: "برامج النساء", teacher: "أ. فاطمة الزهراني", progress: 90, status: "منتظم", joinDate: "2025-07-11", en: { name: "Noura Al-Qahtani", program: "Women's Programs", teacher: "Ust. Fatima Al-Zahrani" } },
  { id: "as7", name: "هند السبيعي", program: "براعم متقن", teacher: "أ. سارة الحربي", progress: 55, status: "منتظم", joinDate: "2026-02-20", en: { name: "Hind Al-Subaie", program: "Motqen Kids", teacher: "Ust. Sarah Al-Harbi" } },
  { id: "as8", name: "منى العتيبي", program: "القراءات العشر", teacher: "أ. خالد المطيري", progress: 30, status: "متأخر", joinDate: "2026-03-08", en: { name: "Mona Al-Otaibi", program: "The Ten Readings", teacher: "Ust. Khalid Al-Mutairi" } },
];

export type AdminProgram = {
  slug: string;
  title: string;
  enrolled: number;
  teachers: number;
  monthlyRevenue: number;
  status: "منشور" | "مسودة";
  en: { title: string };
};

export const adminPrograms: AdminProgram[] = [
  { slug: "hifz-mutqan", title: "الحفظ المتقن", enrolled: 980, teachers: 14, monthlyRevenue: 168000, status: "منشور", en: { title: "Mastery Memorization" } },
  { slug: "tilawa-tajweed", title: "التلاوة والتجويد", enrolled: 540, teachers: 8, monthlyRevenue: 92000, status: "منشور", en: { title: "Recitation & Tajweed" } },
  { slug: "muraja-hifz", title: "المراجعة والحفظ", enrolled: 320, teachers: 5, monthlyRevenue: 58000, status: "منشور", en: { title: "Review & Retention" } },
  { slug: "bara-em-mutqin", title: "براعم متقن", enrolled: 410, teachers: 6, monthlyRevenue: 61000, status: "منشور", en: { title: "Motqen Kids" } },
  { slug: "qiraat-ashr", title: "القراءات العشر", enrolled: 95, teachers: 3, monthlyRevenue: 22500, status: "منشور", en: { title: "The Ten Readings" } },
  { slug: "barnamej-nisaa", title: "برامج النساء", enrolled: 135, teachers: 4, monthlyRevenue: 27000, status: "مسودة", en: { title: "Women's Programs" } },
];

export type AdminArticle = {
  slug: string;
  title: string;
  author: string;
  status: "منشور" | "مسودة";
  views: number;
  date: string;
  en: { title: string; author: string };
};

export const adminArticles: AdminArticle[] = [
  { slug: "keeping-quran-after-hifz", title: "كيف تحافظ على القرآن بعد حفظه؟", author: "أ. عبدالله السلمي", status: "منشور", views: 3420, date: "2024-05-30", en: { title: "How to Retain the Quran After Memorizing It", author: "Ust. Abdullah Al-Salmi" } },
  { slug: "raising-kids-on-quran", title: "تربية الأطفال على حفظ القرآن", author: "أ. فاطمة الزهراني", status: "منشور", views: 2810, date: "2024-05-18", en: { title: "Raising Children to Memorize the Quran", author: "Ust. Fatima Al-Zahrani" } },
  { slug: "common-tilawa-mistakes", title: "أخطاء شائعة في تعلم التلاوة", author: "أ. خالد المطيري", status: "منشور", views: 1950, date: "2024-05-10", en: { title: "Common Mistakes in Learning Recitation", author: "Ust. Khalid Al-Mutairi" } },
  { slug: "virtue-of-hifz", title: "فضل حفظ القرآن وتعلمه", author: "فريق متقن", status: "منشور", views: 4100, date: "2024-05-05", en: { title: "The Virtue of Memorizing and Learning the Quran", author: "Motqen Team" } },
  { slug: "effective-revision-tips", title: "نصائح للمراجعة الفعالة", author: "أ. ماجد القحطاني", status: "مسودة", views: 0, date: "2024-04-28", en: { title: "Tips for Effective Review", author: "Ust. Majed Al-Qahtani" } },
  { slug: "tajweed-rules-simplified", title: "أحكام التجويد المبسطة للمبتدئين", author: "أ. سارة الحربي", status: "منشور", views: 2260, date: "2024-04-20", en: { title: "Simplified Tajweed Rules for Beginners", author: "Ust. Sarah Al-Harbi" } },
];

export const adminNotices: Notice[] = [
  {
    id: "an1",
    title: "تحديث سياسة الخصوصية",
    body: "تم تحديث سياسة الخصوصية وشروط الاستخدام لجميع مستخدمي المنصة، يرجى الاطلاع عليها من صفحة الإعدادات.",
    date: "2026-09-03",
    en: {
      title: "Privacy Policy Update",
      body: "The privacy policy and terms of use have been updated for all platform users; please review them from the settings page.",
    },
  },
  {
    id: "an2",
    title: "صيانة مجدولة للمنصة",
    body: "ستشهد المنصة صيانة تقنية مجدولة يوم الجمعة من الساعة 2 إلى 4 فجرًا، قد يتوقف الوصول للمنصة خلال هذه الفترة.",
    date: "2026-08-28",
    en: {
      title: "Scheduled Platform Maintenance",
      body: "The platform will undergo scheduled technical maintenance on Friday from 2 to 4 AM; access to the platform may be interrupted during this period.",
    },
  },
  {
    id: "an3",
    title: "إطلاق نظام تقييم المعلمين",
    body: "تم إطلاق نظام تقييم جديد للمعلمين يعتمد على أداء الحصص ورضا الطلاب، سيظهر في تقارير المعلمين الشهرية.",
    date: "2026-08-18",
    en: {
      title: "Launch of Teacher Rating System",
      body: "A new teacher rating system based on session performance and student satisfaction has been launched; it will appear in monthly teacher reports.",
    },
  },
];

export type GroupSession = {
  id: string;
  title: string;
  program: string;
  teacher: string;
  day: string;
  time: string;
  capacity: number;
  enrolledStudents: string[];
  en: { title: string; program: string; teacher: string; time: string; enrolledStudents: string[] };
};

export const groupSessions: GroupSession[] = [
  {
    id: "group-juz-amma",
    title: "حلقة حفظ جزء عمّ الجماعية",
    program: "الحفظ المتقن",
    teacher: "أ. عبدالله السلمي",
    day: "السبت",
    time: "7:00 م",
    capacity: 6,
    enrolledStudents: ["سلطان عبدالله", "يوسف باشا"],
    en: {
      title: "Group Circle — Memorizing Juz' Amma",
      program: "Mastery Memorization",
      teacher: "Ust. Abdullah Al-Salmi",
      time: "7:00 PM",
      enrolledStudents: ["Sultan Abdullah", "Yousef Basha"],
    },
  },
  {
    id: "group-baqarah-review",
    title: "حلقة مراجعة سورة البقرة",
    program: "المراجعة والحفظ",
    teacher: "أ. عبدالله السلمي",
    day: "الثلاثاء",
    time: "8:00 م",
    capacity: 8,
    enrolledStudents: ["محمد ياسر", "عبدالرحمن خالد", "سلطان عبدالله"],
    en: {
      title: "Group Circle — Reviewing Surah Al-Baqarah",
      program: "Review & Retention",
      teacher: "Ust. Abdullah Al-Salmi",
      time: "8:00 PM",
      enrolledStudents: ["Mohammed Yasser", "Abdulrahman Khaled", "Sultan Abdullah"],
    },
  },
  {
    id: "group-tajweed-circle",
    title: "حلقة التلاوة والتجويد الجماعية",
    program: "التلاوة والتجويد",
    teacher: "أ. عبدالله السلمي",
    day: "الأحد",
    time: "6:00 م",
    capacity: 5,
    enrolledStudents: ["يوسف باشا", "عبدالرحمن خالد", "محمد ياسر", "سلطان عبدالله", "نورة القحطاني"],
    en: {
      title: "Group Circle — Recitation & Tajweed",
      program: "Recitation & Tajweed",
      teacher: "Ust. Abdullah Al-Salmi",
      time: "6:00 PM",
      enrolledStudents: ["Yousef Basha", "Abdulrahman Khaled", "Mohammed Yasser", "Sultan Abdullah", "Noura Al-Qahtani"],
    },
  },
];
