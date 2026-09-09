import { useTranslations } from "next-intl";
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

export function useAdminNav(): DashboardNavItem[] {
  const t = useTranslations("Dashboard.nav");
  return [
    { href: "/dashboard/admin", label: t("home"), icon: IconHome },
    { href: "/dashboard/admin/teachers", label: t("teachers"), icon: IconTeacherBadge },
    { href: "/dashboard/admin/students", label: t("students"), icon: IconUsers },
    { href: "/dashboard/admin/programs", label: t("programs"), icon: IconQuran },
    { href: "/dashboard/admin/articles", label: t("articles"), icon: IconFolder },
    { href: "/dashboard/admin/reports", label: t("reports"), icon: IconChart },
    { href: "/dashboard/admin/notices", label: t("notices"), icon: IconBell },
  ];
}
