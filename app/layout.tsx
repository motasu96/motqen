import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/portfolio-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.fullName,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "بورتفوليو فيديو بالذكاء الاصطناعي",
    "فيديو توليدي",
    "تصميم رقمي",
    "موشن غرافيك",
    "إخراج إبداعي",
  ],
  openGraph: {
    title: SITE.fullName,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [{ url: "/images/og-cover.webp", width: 1200, height: 630 }],
    type: "website",
    locale: "ar",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.fullName,
    description: SITE.description,
    images: ["/images/og-cover.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050807",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-motion="unset">
      <body>{children}</body>
    </html>
  );
}
