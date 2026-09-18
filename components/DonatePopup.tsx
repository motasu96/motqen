"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconHeart, IconX } from "./icons";

const STORAGE_KEY = "motqen_donate_popup_seen";
const SHOW_DELAY_MS = 3000;

export default function DonatePopup() {
  const t = useTranslations("DonatePopup");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (seen) return;

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="animate-overlay-in absolute inset-0 bg-black/50"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-popup-title"
        className="animate-toast-in relative w-full max-w-sm rounded-card-lg border border-line bg-card p-7 text-center shadow-soft"
      >
        <button
          onClick={close}
          aria-label={t("closeAria")}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-bg hover:text-ink"
        >
          <IconX className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
          <IconHeart className="h-7 w-7 text-gold-dark" aria-hidden="true" />
        </span>

        <h2 id="donate-popup-title" className="mt-4 text-lg font-extrabold text-ink">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("description")}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link href="/donate" onClick={close} className="btn-primary w-full justify-center">
            <IconHeart className="h-4 w-4" aria-hidden="true" />
            {t("cta")}
          </Link>
          <button onClick={close} className="text-sm font-bold text-ink-soft hover:text-gold-dark">
            {t("dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
