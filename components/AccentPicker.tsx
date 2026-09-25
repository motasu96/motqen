"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconCheck, IconPalette } from "./icons";

const ACCENT_THEMES = [
  { id: "visual-blue", from: "#003d4d", to: "#00c996", nameKey: "accentVisualBlue" },
  { id: "compass", from: "#516b8b", to: "#056b3b", nameKey: "accentCompass" },
  { id: "coffee-gold", from: "#554023", to: "#c99846", nameKey: "accentCoffeeGold" },
  { id: "harvey", from: "#1f4037", to: "#99f2c8", nameKey: "accentHarvey" },
  { id: "metapolis", from: "#659999", to: "#f4791f", nameKey: "accentMetapolis" },
  { id: "sand-to-blue", from: "#3E5151", to: "#DECBA4", nameKey: "accentSandToBlue" },
] as const;

export default function AccentPicker({ className = "" }: { className?: string }) {
  const t = useTranslations("Theme");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setAccent(document.documentElement.getAttribute("data-accent"));
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function applyAccent(id: string | null) {
    setAccent(id);
    setOpen(false);
    if (id) {
      document.documentElement.setAttribute("data-accent", id);
      try {
        localStorage.setItem("motqen_accent", id);
      } catch {}
    } else {
      document.documentElement.removeAttribute("data-accent");
      try {
        localStorage.removeItem("motqen_accent");
      } catch {}
    }
  }

  if (!mounted) {
    return <span className={`inline-block h-11 w-11 shrink-0 ${className}`} aria-hidden="true" />;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("accentPickerLabel")}
        aria-expanded={open}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink-soft transition-colors hover:text-gold-dark active:scale-95 ${className}`}
      >
        <IconPalette className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-up absolute end-0 top-full z-50 mt-2 w-64 rounded-2xl border border-line bg-card p-3 shadow-soft"
        >
          <p className="mb-2 px-1 text-xs font-bold text-ink-soft">{t("accentPickerTitle")}</p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => applyAccent(null)}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-start text-sm font-medium text-ink transition-colors hover:bg-bg"
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full border border-line"
                style={{ background: "linear-gradient(135deg, #C89B4A, #A9832F)" }}
                aria-hidden="true"
              />
              <span className="flex-1">{t("accentDefault")}</span>
              {!accent && <IconCheck className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />}
            </button>
            {ACCENT_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => applyAccent(theme.id)}
                className="flex items-center gap-3 rounded-xl px-2 py-2 text-start text-sm font-medium text-ink transition-colors hover:bg-bg"
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-full border border-line"
                  style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                  aria-hidden="true"
                />
                <span className="flex-1">{t(theme.nameKey)}</span>
                {accent === theme.id && <IconCheck className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
