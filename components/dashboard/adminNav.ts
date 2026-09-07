import {
  IconBell,
  IconChart,
  IconFolder,
  IconHome,
  IconQuran,
  IconTeacherBadge,
  IconUsers,
} from "@/components/icons";
import { DashboardNavItem } from "./DashboardShell";

export const adminNav: DashboardNavItem[] = [
  { href: "/dashboard/admin", label: "الرئيسية", icon: IconHome },
  { href: "/dashboard/admin/teachers", label: "المعلمون", icon: IconTeacherBadge },
  { href: "/dashboard/admin/students", label: "الطلاب", icon: IconUsers },
  { href: "/dashboard/admin/programs", label: "البرامج", icon: IconQuran },
  { href: "/dashboard/admin/articles", label: "المقالات", icon: IconFolder },
  { href: "/dashboard/admin/reports", label: "التقارير", icon: IconChart },
  { href: "/dashboard/admin/notices", label: "الإعلانات", icon: IconBell },
];
