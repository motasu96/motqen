"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  if (isDashboard) {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only z-[200] rounded-pill bg-ink px-5 py-2.5 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {t("skipToContent")}
        </a>
        <main id="main-content" className="flex-1">
          <PageTransition pathname={pathname}>{children}</PageTransition>
        </main>
      </>
    );
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[200] rounded-pill bg-ink px-5 py-2.5 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t("skipToContent")}
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <PageTransition pathname={pathname}>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
