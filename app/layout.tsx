import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Site" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s",
    },
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: t("siteName"),
      locale: t("ogLocale"),
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = await getTranslations({ locale, namespace: "Nav" });

  return (
    <html lang={locale} dir={dir} className={tajawal.variable}>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only z-[200] rounded-pill bg-ink px-5 py-2.5 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <SiteChrome>{children}</SiteChrome>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
