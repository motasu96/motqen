import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("motqen_theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

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
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={tajawal.variable}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-ink antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
