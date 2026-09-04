import {
  IconBell,
  IconBook,
  IconChart,
  IconExam,
  IconFolder,
  IconHome,
  IconTask,
} from "@/components/icons";
import { DashboardNavItem } from "./DashboardShell";

export const studentNav: DashboardNavItem[] = [
  { href: "/dashboard/student", label: "الرئيسية", icon: IconHome },
  { href: "/dashboard/student/lessons", label: "دروسي", icon: IconBook },
  { href: "/dashboard/student/homework", label: "الواجبات", icon: IconTask },
  { href: "/dashboard/student/reports", label: "التقارير", icon: IconChart },
  { href: "/dashboard/student/exams", label: "الاختبارات", icon: IconExam },
  { href: "/dashboard/student/archive", label: "المحفوظات", icon: IconFolder },
  { href: "/dashboard/student/notices", label: "الإعلانات", icon: IconBell },
];
