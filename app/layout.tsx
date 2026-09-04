import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "متقن | مقرأة القرآن الكريم",
  description: "منصة تعليمية إلكترونية متخصصة في تعليم القرآن الكريم عن بُعد، بإشراف نخبة من المعلمين والمعلمات.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-ink antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
