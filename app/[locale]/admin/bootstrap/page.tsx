"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { IconShield, IconCheck } from "@/components/icons";

export default function AdminBootstrapPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { showToast } = useToast();
  const t = useTranslations("AdminBootstrap");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) ?? "";
    const password = (form.get("password") as string) ?? "";
    const fullName = (form.get("fullName") as string) ?? "";

    setLoading(true);
    try {
      const res = await fetch("/api/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      if (res.ok) {
        setDone(true);
        showToast(t("toastSuccess"), "success");
      } else {
        const body = await res.json().catch(() => null);
        showToast(body?.reason === "already_bootstrapped" ? t("errorAlreadyExists") : t("errorGeneric"), "error");
      }
    } catch {
      showToast(t("errorGeneric"), "error");
    }
    setLoading(false);
  }

  return (
    <div className="container-page flex min-h-screen items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        {done ? (
          <div className="animate-fade-up flex flex-col items-center gap-3 text-center">
            <Logo />
            <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-gold-light" aria-hidden="true">
              <IconCheck className="h-7 w-7 text-gold-dark" />
            </span>
            <h1 className="text-2xl font-extrabold text-ink">{t("successTitle")}</h1>
            <p className="text-sm text-ink-soft">{t("successDesc")}</p>
            <Link href="/admin/login" className="btn-primary w-full">
              {t("goToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <Logo />
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-light">
                <IconShield className="h-5 w-5 text-gold-dark" />
              </span>
              <h1 className="text-2xl font-extrabold text-ink">{t("title")}</h1>
              <p className="text-sm text-ink-soft">{t("subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="ba-fullName" className="text-sm font-bold text-ink">{t("fullNameLabel")}</label>
                <input id="ba-fullName" name="fullName" required className="input" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="ba-email" className="text-sm font-bold text-ink">{t("emailLabel")}</label>
                <input id="ba-email" name="email" required type="email" dir="ltr" className="input" placeholder="admin@motqen.site" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="ba-password" className="text-sm font-bold text-ink">{t("passwordLabel")}</label>
                <input id="ba-password" name="password" required type="password" minLength={6} dir="ltr" className="input" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-70">
                {loading ? t("submitting") : t("submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
