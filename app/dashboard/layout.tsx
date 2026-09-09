import type { Metadata } from "next";
import DashboardChrome from "@/components/DashboardChrome";

export const metadata: Metadata = {
  title: "لوحة التحكم | متقن",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardChrome>{children}</DashboardChrome>;
}
