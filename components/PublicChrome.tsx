"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

export default function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Nav");

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
