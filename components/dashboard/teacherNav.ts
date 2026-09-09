import { useTranslations } from "next-intl";
import {
  IconBell,
  IconChart,
  IconHome,
  IconTask,
  IconUsers,
  IconCalendar,
} from "@/components/icons";
import { DashboardNavItem } from "./DashboardShell";

export function useTeacherNav(): DashboardNavItem[] {
  const t = useTranslations("Dashboard.nav");
  return [
    { href: "/dashboard/teacher", label: t("home"), icon: IconHome },
    { href: "/dashboard/teacher/students", label: t("students"), icon: IconUsers },
    { href: "/dashboard/teacher/schedule", label: t("schedule"), icon: IconCalendar },
    { href: "/dashboard/teacher/homework", label: t("homework"), icon: IconTask },
    { href: "/dashboard/teacher/reports", label: t("reports"), icon: IconChart },
    { href: "/dashboard/teacher/notices", label: t("notices"), icon: IconBell },
  ];
}
