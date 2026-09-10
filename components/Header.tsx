"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconHeart, IconMenu, IconX } from "./icons";
import Logo from "./Logo";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Nav");

  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/programs", label: t("programs") },
    { href: "/teachers", label: t("teachers") },
    { href: "/articles", label: t("articles") },
    { href: "/contact", label: t("contact") },
  ];

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/90 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-gold-dark" : "text-ink hover:text-gold-dark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle className="h-9 w-9" />
          <LocaleSwitcher />
          <Link
            href="/donate"
            className="inline-flex items-center gap-1.5 rounded-pill border border-gold/40 bg-gold-light px-4 py-2 text-sm font-bold text-gold-dark transition-colors hover:bg-gold/20"
          >
            <IconHeart className="h-4 w-4" aria-hidden="true" />
            {t("donate")}
          </Link>
          <Link href="/login" className="text-sm font-bold text-ink hover:text-gold-dark">
            {t("login")}
          </Link>
          <Link href="/signup" className="btn-primary">
            {t("signup")}
          </Link>
        </div>

        <button
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card transition-transform active:scale-95 lg:hidden"
        >
          {open ? <IconX className="h-5 w-5" aria-hidden="true" /> : <IconMenu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="animate-fade-up border-t border-line bg-card lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-bg"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-line pt-4">
              <LocaleSwitcher />
              <ThemeToggle className="h-9 w-9" />
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/donate"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-pill border border-gold/40 bg-gold-light px-4 py-2.5 text-sm font-bold text-gold-dark"
              >
                <IconHeart className="h-4 w-4" aria-hidden="true" />
                {t("donate")}
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                {t("login")}
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary w-full">
                {t("signup")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
