"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  if (isDashboard) {
    return (
      <main id="main-content" className="flex-1">
        <PageTransition pathname={pathname}>{children}</PageTransition>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <PageTransition pathname={pathname}>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
