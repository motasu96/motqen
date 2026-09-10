"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IconMoon, IconSun } from "./icons";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("Theme");
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("motqen_theme", next ? "dark" : "light");
    } catch {}
  }

  if (!mounted) {
    return <span className={`inline-block h-11 w-11 shrink-0 ${className}`} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("toggleToLight") : t("toggleToDark")}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink-soft transition-colors hover:text-gold-dark active:scale-95 ${className}`}
    >
      {isDark ? <IconSun className="h-5 w-5" aria-hidden="true" /> : <IconMoon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
