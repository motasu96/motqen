import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دخول المدير | متقن",
  robots: { index: false, follow: false },
};

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
