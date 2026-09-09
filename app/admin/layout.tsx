import type { Metadata } from "next";
import DashboardChrome from "@/components/DashboardChrome";

export const metadata: Metadata = {
  title: "دخول المدير | متقن",
  robots: { index: false, follow: false },
};

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <DashboardChrome>{children}</DashboardChrome>;
}
