"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconMenu, IconX } from "./icons";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "عن متقن" },
  { href: "/programs", label: "برامجنا" },
  { href: "/teachers", label: "المعلمون" },
  { href: "/articles", label: "المقالات" },
  { href: "/contact", label: "التواصل" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
          <Link href="/login" className="text-sm font-bold text-ink hover:text-gold-dark">
            تسجيل دخول
          </Link>
          <Link href="/signup" className="btn-primary">
            سجل الآن
          </Link>
        </div>

        <button
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
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
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
              <Link href="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                تسجيل دخول
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary w-full">
                سجل الآن
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
