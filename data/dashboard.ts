export type LessonRecord = {
  id: string;
  date: string;
  time: string;
  teacher: string;
  surah: string;
  range: string;
  status: "مكتملة" | "قادمة" | "ملغاة";
};

export const lessons: LessonRecord[] = [
  { id: "l1", date: "2026-09-06", time: "5:30 م", teacher: "أ. عبدالله السلمي", surah: "سورة البقرة", range: "من 120 إلى 145", status: "قادمة" },
  { id: "l2", date: "2026-08-30", time: "5:30 م", teacher: "أ. عبدالله السلمي", surah: "سورة البقرة", range: "من 95 إلى 120", status: "مكتملة" },
  { id: "l3", date: "2026-08-23", time: "5:30 م", teacher: "أ. عبدالله السلمي", surah: "سورة البقرة", range: "من 70 إلى 95", status: "مكتملة" },
  { id: "l4", date: "2026-08-16", time: "5:30 م", teacher: "أ. عبدالله السلمي", surah: "سورة البقرة", range: "من 40 إلى 70", status: "مكتملة" },
  { id: "l5", date: "2026-08-09", time: "5:30 م", teacher: "أ. عبدالله السلمي", surah: "سورة البقرة", range: "من 1 إلى 40", status: "ملغاة" },
];

export type HomeworkItem = {
  id: string;
  title: string;
  type: "تسميع" | "مراجعة" | "تجويد";
  dueDate: string;
  status: "بانتظار التسليم" | "تم التسليم" | "تم التصحيح";
  grade?: string;
};

export const homework: HomeworkItem[] = [
  { id: "h1", title: "تسميع الآيات 120 إلى 145", type: "تسميع", dueDate: "2026-09-06", status: "بانتظار التسليم" },
  { id: "h2", title: "مراجعة سورة البقرة من 100 إلى 120", type: "مراجعة", dueDate: "2026-09-03", status: "تم التسليم" },
  { id: "h3", title: "تطبيق أحكام المد في سورة البقرة", type: "تجويد", dueDate: "2026-08-28", status: "تم التصحيح", grade: "9.5 / 10" },
  { id: "h4", title: "تسميع الآيات 70 إلى 95", type: "تسميع", dueDate: "2026-08-23", status: "تم التصحيح", grade: "9 / 10" },
];

export type ExamRecord = {
  id: string;
  title: string;
  date: string;
  status: "قادم" | "مكتمل";
  score?: number;
  maxScore?: number;
};

export const exams: ExamRecord[] = [
  { id: "e1", title: "اختبار الجزء الأول — نصف الحفظ", date: "2026-09-15", status: "قادم" },
  { id: "e2", title: "اختبار شهري — سورة البقرة (1-100)", date: "2026-08-20", status: "مكتمل", score: 92, maxScore: 100 },
  { id: "e3", title: "اختبار تجويد — أحكام النون الساكنة", date: "2026-07-18", status: "مكتمل", score: 88, maxScore: 100 },
];

export type ArchiveItem = {
  id: string;
  surah: string;
  juz: string;
  completedDate: string;
  pages: number;
};

export const archive: ArchiveItem[] = [
  { id: "a1", surah: "سورة الفاتحة", juz: "الجزء 1", completedDate: "2025-11-02", pages: 1 },
  { id: "a2", surah: "جزء عمّ (30)", juz: "الجزء 30", completedDate: "2025-12-20", pages: 22 },
  { id: "a3", surah: "جزء تبارك (29)", juz: "الجزء 29", completedDate: "2026-03-05", pages: 22 },
  { id: "a4", surah: "سورة البقرة (1-95)", juz: "الجزء 1-2", completedDate: "2026-08-30", pages: 18 },
];

export type Notice = {
  id: string;
  title: string;
  body: string;
  date: string;
};

export const studentNotices: Notice[] = [
  { id: "n1", title: "إجازة نهاية الفصل الدراسي", body: "تعلن مقرأة متقن عن إجازة الحصص من 20 إلى 25 سبتمبر، وستُستأنف الحصص بعدها حسب الجدول المعتاد.", date: "2026-09-01" },
  { id: "n2", title: "تحديث نظام الشارات", body: "تم إطلاق نظام شارات جديد لتحفيز الطلاب على الحفظ والمراجعة المستمرة، تحقق من صفحتك الرئيسية.", date: "2026-08-22" },
  { id: "n3", title: "تذكير بموعد الاختبار الشهري", body: "نذكّر جميع الطلاب بموعد الاختبار الشهري القادم، يرجى مراجعة المقرر المحدد مسبقًا.", date: "2026-08-15" },
];

export const teacherNotices: Notice[] = [
  { id: "tn1", title: "اجتماع المعلمين الشهري", body: "يُعقد الاجتماع الشهري للمعلمين والمعلمات يوم الخميس القادم الساعة 8 مساءً عبر الاتصال المرئي.", date: "2026-09-02" },
  { id: "tn2", title: "تحديث سياسة تقييم الواجبات", body: "تم تحديث معايير تقييم الواجبات الصوتية، يرجى الاطلاع على الدليل المرفق في لوحة التحكم.", date: "2026-08-25" },
  { id: "tn3", title: "فتح التسجيل لدورة تدريبية", body: "تم فتح التسجيل في دورة \"أساليب تحفيظ الأطفال\" المجانية للمعلمين والمعلمات هذا الشهر.", date: "2026-08-10" },
];

export type TeacherStudent = {
  id: string;
  name: string;
  program: string;
  progress: number;
  lastSession: string;
  status: "منتظم" | "متأخر" | "متعثر";
};

export const teacherStudents: TeacherStudent[] = [
  { id: "s1", name: "أحمد محمد", program: "الحفظ المتقن", progress: 68, lastSession: "2026-08-30", status: "منتظم" },
  { id: "s2", name: "عبدالرحمن خالد", program: "الحفظ المتقن", progress: 41, lastSession: "2026-08-19", status: "متأخر" },
  { id: "s3", name: "يوسف باشا", program: "التلاوة والتجويد", progress: 77, lastSession: "2026-08-28", status: "منتظم" },
  { id: "s4", name: "محمد ياسر", program: "المراجعة والحفظ", progress: 22, lastSession: "2026-08-10", status: "متعثر" },
  { id: "s5", name: "سلطان عبدالله", program: "الحفظ المتقن", progress: 85, lastSession: "2026-08-31", status: "منتظم" },
];

export type ScheduleSlot = {
  id: string;
  day: string;
  time: string;
  student: string;
  program: string;
};

export const teacherSchedule: ScheduleSlot[] = [
  { id: "sc1", day: "السبت", time: "4:00 م", student: "أحمد محمد", program: "الحفظ المتقن" },
  { id: "sc2", day: "السبت", time: "5:30 م", student: "سلطان عبدالله", program: "الحفظ المتقن" },
  { id: "sc3", day: "الأحد", time: "4:00 م", student: "يوسف باشا", program: "التلاوة والتجويد" },
  { id: "sc4", day: "الاثنين", time: "7:00 م", student: "عبدالرحمن خالد", program: "الحفظ المتقن" },
  { id: "sc5", day: "الثلاثاء", time: "5:30 م", student: "محمد ياسر", program: "المراجعة والحفظ" },
  { id: "sc6", day: "الأربعاء", time: "8:30 م", student: "أحمد محمد", program: "الحفظ المتقن" },
];

export type TeacherHomeworkReview = {
  id: string;
  student: string;
  title: string;
  submittedDate: string;
  status: "بانتظار المراجعة" | "تمت المراجعة";
  grade?: string;
};

export const teacherHomeworkReviews: TeacherHomeworkReview[] = [
  { id: "th1", student: "أحمد محمد", title: "تسميع الآيات 120 إلى 145", submittedDate: "2026-09-01", status: "بانتظار المراجعة" },
  { id: "th2", student: "يوسف باشا", title: "تطبيق أحكام التجويد — سورة يس", submittedDate: "2026-09-01", status: "بانتظار المراجعة" },
  { id: "th3", student: "سلطان عبدالله", title: "مراجعة جزء عمّ كاملًا", submittedDate: "2026-08-31", status: "بانتظار المراجعة" },
  { id: "th4", student: "عبدالرحمن خالد", title: "تسميع الآيات 40 إلى 70", submittedDate: "2026-08-29", status: "تمت المراجعة", grade: "8.5 / 10" },
  { id: "th5", student: "محمد ياسر", title: "مراجعة سورة الملك", submittedDate: "2026-08-27", status: "تمت المراجعة", grade: "7 / 10" },
];

export type PlatformStat = {
  label: string;
  value: string;
  delta?: string;
};

export const platformStats: PlatformStat[] = [
  { label: "إجمالي الطلاب", value: "2,480", delta: "+12% عن الشهر الماضي" },
  { label: "إجمالي المعلمين", value: "34", delta: "+3 معلمين جدد" },
  { label: "البرامج النشطة", value: "6" },
  { label: "الإيرادات الشهرية", value: "412,500 ر.س", delta: "+8% عن الشهر الماضي" },
];

export type AdminTeacher = {
  id: string;
  name: string;
  specialty: string;
  students: number;
  rating: number;
  status: "نشط" | "موقوف" | "قيد المراجعة";
  joinDate: string;
};

export const adminTeachers: AdminTeacher[] = [
  { id: "at1", name: "أ. عبدالله السلمي", specialty: "التحفيظ والتجويد", students: 1200, rating: 4.9, status: "نشط", joinDate: "2019-03-12" },
  { id: "at2", name: "أ. فاطمة الزهراني", specialty: "برامج النساء والأطفال", students: 950, rating: 4.8, status: "نشط", joinDate: "2020-07-01" },
  { id: "at3", name: "أ. خالد المطيري", specialty: "القراءات العشر", students: 180, rating: 4.7, status: "نشط", joinDate: "2021-01-20" },
  { id: "at4", name: "أ. سارة الحربي", specialty: "براعم متقن", students: 410, rating: 4.6, status: "نشط", joinDate: "2021-09-15" },
  { id: "at5", name: "أ. ماجد القحطاني", specialty: "المراجعة والحفظ", students: 260, rating: 4.5, status: "قيد المراجعة", joinDate: "2026-08-01" },
  { id: "at6", name: "أ. نورة العتيبي", specialty: "التلاوة والتجويد", students: 95, rating: 4.9, status: "موقوف", joinDate: "2022-02-10" },
];

export type AdminStudent = {
  id: string;
  name: string;
  program: string;
  teacher: string;
  progress: number;
  status: "منتظم" | "متأخر" | "متعثر";
  joinDate: string;
};

export const adminStudents: AdminStudent[] = [
  { id: "as1", name: "أحمد محمد", program: "الحفظ المتقن", teacher: "أ. عبدالله السلمي", progress: 68, status: "منتظم", joinDate: "2025-10-02" },
  { id: "as2", name: "عبدالرحمن خالد", program: "الحفظ المتقن", teacher: "أ. عبدالله السلمي", progress: 41, status: "متأخر", joinDate: "2025-11-19" },
  { id: "as3", name: "يوسف باشا", program: "التلاوة والتجويد", teacher: "أ. نورة العتيبي", progress: 77, status: "منتظم", joinDate: "2025-09-05" },
  { id: "as4", name: "محمد ياسر", program: "المراجعة والحفظ", teacher: "أ. ماجد القحطاني", progress: 22, status: "متعثر", joinDate: "2026-01-14" },
  { id: "as5", name: "سلطان عبدالله", program: "الحفظ المتقن", teacher: "أ. عبدالله السلمي", progress: 85, status: "منتظم", joinDate: "2025-08-30" },
  { id: "as6", name: "نورة القحطاني", program: "برامج النساء", teacher: "أ. فاطمة الزهراني", progress: 90, status: "منتظم", joinDate: "2025-07-11" },
  { id: "as7", name: "هند السبيعي", program: "براعم متقن", teacher: "أ. سارة الحربي", progress: 55, status: "منتظم", joinDate: "2026-02-20" },
  { id: "as8", name: "منى العتيبي", program: "القراءات العشر", teacher: "أ. خالد المطيري", progress: 30, status: "متأخر", joinDate: "2026-03-08" },
];

export type AdminProgram = {
  slug: string;
  title: string;
  enrolled: number;
  teachers: number;
  monthlyRevenue: number;
  status: "منشور" | "مسودة";
};

export const adminPrograms: AdminProgram[] = [
  { slug: "hifz-mutqan", title: "الحفظ المتقن", enrolled: 980, teachers: 14, monthlyRevenue: 168000, status: "منشور" },
  { slug: "tilawa-tajweed", title: "التلاوة والتجويد", enrolled: 540, teachers: 8, monthlyRevenue: 92000, status: "منشور" },
  { slug: "muraja-hifz", title: "المراجعة والحفظ", enrolled: 320, teachers: 5, monthlyRevenue: 58000, status: "منشور" },
  { slug: "bara-em-mutqin", title: "براعم متقن", enrolled: 410, teachers: 6, monthlyRevenue: 61000, status: "منشور" },
  { slug: "qiraat-ashr", title: "القراءات العشر", enrolled: 95, teachers: 3, monthlyRevenue: 22500, status: "منشور" },
  { slug: "barnamej-nisaa", title: "برامج النساء", enrolled: 135, teachers: 4, monthlyRevenue: 27000, status: "مسودة" },
];

export type AdminArticle = {
  slug: string;
  title: string;
  author: string;
  status: "منشور" | "مسودة";
  views: number;
  date: string;
};

export const adminArticles: AdminArticle[] = [
  { slug: "keeping-quran-after-hifz", title: "كيف تحافظ على القرآن بعد حفظه؟", author: "أ. عبدالله السلمي", status: "منشور", views: 3420, date: "2024-05-30" },
  { slug: "raising-kids-on-quran", title: "تربية الأطفال على حفظ القرآن", author: "أ. فاطمة الزهراني", status: "منشور", views: 2810, date: "2024-05-18" },
  { slug: "common-tilawa-mistakes", title: "أخطاء شائعة في تعلم التلاوة", author: "أ. خالد المطيري", status: "منشور", views: 1950, date: "2024-05-10" },
  { slug: "virtue-of-hifz", title: "فضل حفظ القرآن وتعلمه", author: "فريق متقن", status: "منشور", views: 4100, date: "2024-05-05" },
  { slug: "effective-revision-tips", title: "نصائح للمراجعة الفعالة", author: "أ. ماجد القحطاني", status: "مسودة", views: 0, date: "2024-04-28" },
  { slug: "tajweed-rules-simplified", title: "أحكام التجويد المبسطة للمبتدئين", author: "أ. سارة الحربي", status: "منشور", views: 2260, date: "2024-04-20" },
];

export const adminNotices: Notice[] = [
  { id: "an1", title: "تحديث سياسة الخصوصية", body: "تم تحديث سياسة الخصوصية وشروط الاستخدام لجميع مستخدمي المنصة، يرجى الاطلاع عليها من صفحة الإعدادات.", date: "2026-09-03" },
  { id: "an2", title: "صيانة مجدولة للمنصة", body: "ستشهد المنصة صيانة تقنية مجدولة يوم الجمعة من الساعة 2 إلى 4 فجرًا، قد يتوقف الوصول للمنصة خلال هذه الفترة.", date: "2026-08-28" },
  { id: "an3", title: "إطلاق نظام تقييم المعلمين", body: "تم إطلاق نظام تقييم جديد للمعلمين يعتمد على أداء الحصص ورضا الطلاب، سيظهر في تقارير المعلمين الشهرية.", date: "2026-08-18" },
];
