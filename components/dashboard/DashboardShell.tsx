"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ReactNode, useEffect, useState } from "react";
import { ComponentType } from "react";
import { IconLogout, IconMenu, IconX } from "@/components/icons";
import Logo from "@/components/Logo";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export default function DashboardShell({
  navItems,
  userName,
  userSubtitle,
  children,
}: {
  navItems: DashboardNavItem[];
  userName: string;
  userSubtitle: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("Dashboard");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const nav = (
    <div className="flex h-full flex-col gap-6 p-6">
      <Logo />
      <div className="flex items-center gap-3 rounded-2xl bg-bg p-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-light text-sm font-extrabold text-gold-dark">
          {userName[0]}
        </div>
        <div>
          <div className="text-sm font-extrabold text-ink">{userName}</div>
          <div className="text-xs text-ink-soft">{userSubtitle}</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
                active ? "bg-gold-light text-gold-dark" : "text-ink-soft hover:bg-bg hover:text-ink"
              }`}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/login" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-bg hover:text-red-500">
        <IconLogout className="h-5 w-5" aria-hidden="true" />
        {t("logout")}
      </Link>
    </div>
  );

  return (
    <div className="container-page flex gap-6 py-6 sm:py-8">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="card sticky top-24">{nav}</div>
      </aside>

      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <Logo />
          <button
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card transition-transform active:scale-95"
            aria-label={t("openMenu")}
            aria-expanded={open}
            aria-controls="dashboard-mobile-nav"
          >
            <IconMenu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="animate-overlay-in absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
            <div
              id="dashboard-mobile-nav"
              className="animate-drawer-in absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-card shadow-soft"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line transition-transform active:scale-95"
                aria-label={t("closeMenu")}
              >
                <IconX className="h-4 w-4" aria-hidden="true" />
              </button>
              {nav}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
