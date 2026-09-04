import {
  IconBell,
  IconChart,
  IconHome,
  IconTask,
  IconUsers,
  IconCalendar,
} from "@/components/icons";
import { DashboardNavItem } from "./DashboardShell";

export const teacherNav: DashboardNavItem[] = [
  { href: "/dashboard/teacher", label: "الرئيسية", icon: IconHome },
  { href: "/dashboard/teacher/students", label: "الطلاب", icon: IconUsers },
  { href: "/dashboard/teacher/schedule", label: "الجدول", icon: IconCalendar },
  { href: "/dashboard/teacher/homework", label: "الواجبات", icon: IconTask },
  { href: "/dashboard/teacher/reports", label: "التقارير", icon: IconChart },
  { href: "/dashboard/teacher/notices", label: "الإعلانات", icon: IconBell },
];
