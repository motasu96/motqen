"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconCompassOff, IconPlay } from "@/components/icons";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-light">
        <IconCompassOff className="h-10 w-10 text-gold-dark" />
      </span>
      <p className="mt-6 text-6xl font-extrabold text-gold-dark sm:text-7xl">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 max-w-md text-ink-soft">{t("description")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="btn-primary">
          {t("backHome")}
        </Link>
        <Link href="/programs" className="btn-outline">
          <IconPlay className="h-4 w-4" />
          {t("browsePrograms")}
        </Link>
      </div>
    </div>
  );
}
