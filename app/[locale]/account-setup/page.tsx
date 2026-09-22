"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import PasswordInput from "@/components/PasswordInput";
import { IconCheck } from "@/components/icons";
import { useToast } from "@/components/Toast";

function AccountSetupForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const { showToast } = useToast();
  const t = useTranslations("ResetPassword");
  const tLogin = useTranslations("Login");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = ((data.get("password") as string) ?? "").trim();
    const confirmPassword = ((data.get("confirmPassword") as string) ?? "").trim();

    if (password.length < 6) {
      showToast(t("errorPassword"), "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast(t("errorPasswordMatch"), "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/account-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        showToast(t("toastSuccess"), "success");
        setDone(true);
      } else {
        const body = await res.json().catch(() => null);
        setErrorReason(body?.reason ?? "generic");
        showToast(t("errorGeneric", { error: body?.error ?? "" }), "error");
      }
    } catch {
      setErrorReason("generic");
      showToast(t("errorGeneric", { error: "" }), "error");
    }
    setSubmitting(false);
  }

  const tokenMissing = !token;

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        {done ? (
          <div className="animate-fade-up flex flex-col items-center gap-3 text-center">
            <Logo />
            <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-gold-light" aria-hidden="true">
              <IconCheck className="h-7 w-7 text-gold-dark" />
            </span>
            <h1 className="text-2xl font-extrabold text-ink">{t("successTitle")}</h1>
            <p className="text-sm text-ink-soft">{t("successDesc")}</p>
            <Link href="/login" className="btn-primary w-full">
              {t("backToLogin")}
            </Link>
          </div>
        ) : tokenMissing || errorReason === "not_found" || errorReason === "expired" || errorReason === "already_used" ? (
          <div className="animate-fade-up flex flex-col items-center gap-3 text-center">
            <Logo />
            <h1 className="text-2xl font-extrabold text-ink">{t("title")}</h1>
            <p className="text-sm text-ink-soft">{t("errorInvalidLink")}</p>
            <Link href="/forgot-password" className="btn-primary w-full">
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <Logo />
              <h1 className="mt-2 text-2xl font-extrabold text-ink">{t("title")}</h1>
              <p className="text-sm text-ink-soft">{t("subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="as-password" className="text-sm font-bold text-ink">{t("newPasswordLabel")}</label>
                <PasswordInput
                  id="as-password"
                  name="password"
                  required
                  dir="ltr"
                  placeholder={t("passwordPlaceholder")}
                  showLabel={tLogin("showPassword")}
                  hideLabel={tLogin("hidePassword")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="as-confirm" className="text-sm font-bold text-ink">{t("confirmPasswordLabel")}</label>
                <PasswordInput
                  id="as-confirm"
                  name="confirmPassword"
                  required
                  dir="ltr"
                  placeholder={t("passwordPlaceholder")}
                  showLabel={tLogin("showPassword")}
                  hideLabel={tLogin("hidePassword")}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full disabled:opacity-70">
                {submitting ? t("submitting") : t("submit")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountSetupPage() {
  return (
    <Suspense fallback={null}>
      <AccountSetupForm />
    </Suspense>
  );
}
