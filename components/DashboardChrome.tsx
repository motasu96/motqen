"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import PageTransition from "./PageTransition";

export default function DashboardChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[200] rounded-pill bg-ink px-5 py-2.5 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        تخطَّ إلى المحتوى الرئيسي
      </a>
      <main id="main-content" className="flex-1">
        <PageTransition pathname={pathname}>{children}</PageTransition>
      </main>
    </>
  );
}
