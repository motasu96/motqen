"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ComponentType } from "react";
import { IconCheck, IconLogout, IconMenu, IconPencil, IconX } from "@/components/icons";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export default function DashboardShell({
  navItems,
  userName,
  userSubtitle,
  onLogout,
  onEditName,
  children,
}: {
  navItems: DashboardNavItem[];
  userName: string;
  userSubtitle: string;
  onLogout?: () => void;
  onEditName?: (newName: string) => Promise<boolean>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [savingName, setSavingName] = useState(false);
  const t = useTranslations("Dashboard");
  const { showToast } = useToast();

  async function submitNameEdit(e: FormEvent) {
    e.preventDefault();
    if (!onEditName) return;
    setSavingName(true);
    const ok = await onEditName(nameInput);
    setSavingName(false);
    showToast(ok ? t("nameUpdated") : t("errorNameUpdate"), ok ? "success" : "error");
    if (ok) setEditingName(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!editingName) setNameInput(userName);
  }, [userName, editingName]);

  function renderNav(inDrawer: boolean) {
    return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Logo />
        {!inDrawer && <ThemeToggle className="h-9 w-9" />}
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-bg p-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light text-sm font-extrabold text-gold-dark">
          {userName[0]}
        </div>
        {editingName ? (
          <form onSubmit={submitNameEdit} className="flex flex-1 items-center gap-1.5">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-line bg-card px-2 py-1 text-sm font-extrabold text-ink"
            />
            <button
              type="submit"
              disabled={savingName}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gold-dark disabled:opacity-50"
              aria-label={t("saveName")}
            >
              <IconCheck className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingName(false);
                setNameInput(userName);
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft"
              aria-label={t("cancelEditName")}
            >
              <IconX className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-ink">{userName}</div>
              <div className="text-xs text-ink-soft">{userSubtitle}</div>
            </div>
            {onEditName && (
              <button
                onClick={() => setEditingName(true)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-gold-dark"
                aria-label={t("editName")}
              >
                <IconPencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
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

      {onLogout ? (
        <button
          onClick={onLogout}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-bg hover:text-red-500"
        >
          <IconLogout className="h-5 w-5" aria-hidden="true" />
          {t("logout")}
        </button>
      ) : (
        <Link href="/login" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-bg hover:text-red-500">
          <IconLogout className="h-5 w-5" aria-hidden="true" />
          {t("logout")}
        </Link>
      )}
    </div>
    );
  }

  return (
    <div className="container-page flex gap-6 py-6 sm:py-8">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="card sticky top-24">{renderNav(false)}</div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-9 w-9" />
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
        </div>

        {open && (
          <div className="fixed inset-0 z-50 h-dvh lg:hidden" role="dialog" aria-modal="true">
            <div className="animate-overlay-in absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div
              id="dashboard-mobile-nav"
              className="animate-drawer-in absolute inset-y-0 right-0 h-dvh w-80 max-w-[85vw] overflow-y-auto bg-card shadow-soft"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line transition-transform active:scale-95"
                aria-label={t("closeMenu")}
              >
                <IconX className="h-4 w-4" aria-hidden="true" />
              </button>
              {renderNav(true)}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
