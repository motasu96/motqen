"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export default function LocaleSwitcher({ className = "" }: { className?: string }) {
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
    <button
      type="button"
      onClick={switchLocale}
      className={`text-sm font-bold text-ink transition-colors hover:text-gold-dark ${className}`}
    >
      {t("language")}
    </button>
  );
}
