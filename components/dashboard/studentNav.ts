import { useTranslations } from "next-intl";
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

export function useStudentNav(): DashboardNavItem[] {
  const t = useTranslations("Dashboard.nav");
  return [
    { href: "/dashboard/student", label: t("home"), icon: IconHome },
    { href: "/dashboard/student/lessons", label: t("myLessons"), icon: IconBook },
    { href: "/dashboard/student/homework", label: t("homework"), icon: IconTask },
    { href: "/dashboard/student/reports", label: t("reports"), icon: IconChart },
    { href: "/dashboard/student/exams", label: t("exams"), icon: IconExam },
    { href: "/dashboard/student/archive", label: t("archive"), icon: IconFolder },
    { href: "/dashboard/student/notices", label: t("notices"), icon: IconBell },
  ];
}
