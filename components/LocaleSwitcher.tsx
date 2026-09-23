"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

// useSearchParams() isn't known at build time, so Next.js requires a
// Suspense boundary around it to keep this route statically prerenderable
// (otherwise the whole page bails out to server-rendering on every
// request). The fallback below is only ever visible for the instant before
// hydration, since useSearchParams() resolves synchronously in the browser.
function LocaleSwitcherButton({ className }: { className: string }) {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextLocale = locale === "ar" ? "en" : "ar";

  function switchLocale() {
    const query = Object.fromEntries(searchParams.entries());
    router.replace({ pathname, query }, { locale: nextLocale });
  }

  return (
    <button type="button" onClick={switchLocale} className={className}>
      {t("language")}
    </button>
  );
}

export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("Nav");
  const fullClassName = `text-sm font-bold text-ink transition-colors hover:text-gold-dark ${className}`;

  return (
    <Suspense fallback={<span className={fullClassName}>{t("language")}</span>}>
      <LocaleSwitcherButton className={fullClassName} />
    </Suspense>
  );
}
