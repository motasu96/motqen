import type { Viewport } from "next";
import { Tajawal } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("motqen_theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
    var accent = localStorage.getItem("motqen_accent");
    if (accent) document.documentElement.setAttribute("data-accent", accent);
  } catch (e) {}
})();
`;

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#C89B4A",
};

// No next-intl server calls here (getLocale()/getTranslations() read the
// request's headers, which forces Next.js to render every single route on
// the server per-request instead of serving a cached static page). lang/dir
// default to the site's default locale (ar/rtl) and are corrected
// client-side by HtmlAttributesSync once next-intl's locale is known;
// per-locale <title>/<meta> come from app/[locale]/layout.tsx instead,
// where the locale is already known statically from the route param.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
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
