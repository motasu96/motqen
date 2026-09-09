import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { ToastProvider } from "@/components/Toast";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.motqen.site";
const SITE_TITLE = "متقن | مقرأة القرآن الكريم";
const SITE_DESCRIPTION =
  "منصة تعليمية إلكترونية متخصصة في تعليم القرآن الكريم عن بُعد، بإشراف نخبة من المعلمين والمعلمات.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "متقن",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only z-[200] rounded-pill bg-ink px-5 py-2.5 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          تخطَّ إلى المحتوى الرئيسي
        </a>
        <ToastProvider>
          <SiteChrome>{children}</SiteChrome>
        </ToastProvider>
      </body>
    </html>
  );
}
