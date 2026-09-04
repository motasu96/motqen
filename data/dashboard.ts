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
