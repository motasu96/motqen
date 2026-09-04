import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "البرامج التعليمية | متقن",
  description: "برامج متنوعة تناسب جميع الأعمار والمستويات في تعليم القرآن الكريم عن بُعد.",
};

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
