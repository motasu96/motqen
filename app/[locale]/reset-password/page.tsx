"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import PasswordInput from "@/components/PasswordInput";
import { IconCheck } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { showToast } = useToast();
  const t = useTranslations("ResetPassword");
  const tLogin = useTranslations("Login");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setReady(true);
      return;
    }
    // Require actual evidence in the URL that this visit came from a recovery
    // link (Supabase appends either a #...type=recovery hash or a ?code=...
    // param) before trusting any session at all. This is what stops a stale,
    // unrelated session left over in the browser from making a plain visit to
    // this page (or an invalid/expired link) falsely look valid — while still
    // accepting a real session once Supabase establishes it, since the
    // PASSWORD_RECOVERY event alone isn't reliably fired by this SDK setup.
    const hasRecoveryEvidence =
      window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).has("code");
    if (!hasRecoveryEvidence) {
      setReady(true);
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setValidLink(true);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidLink(true);
      setReady(true);
    });
    const timeout = setTimeout(() => setReady(true), 3000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

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
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      showToast(t("errorGeneric", { error: error.message }), "error");
      return;
    }
    showToast(t("toastSuccess"), "success");
    setDone(true);
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        {!ready ? null : done ? (
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
        ) : !validLink ? (
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
                <label htmlFor="rp-password" className="text-sm font-bold text-ink">{t("newPasswordLabel")}</label>
                <PasswordInput
                  id="rp-password"
                  name="password"
                  required
                  dir="ltr"
                  placeholder={t("passwordPlaceholder")}
                  showLabel={tLogin("showPassword")}
                  hideLabel={tLogin("hidePassword")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="rp-confirm" className="text-sm font-bold text-ink">{t("confirmPasswordLabel")}</label>
                <PasswordInput
                  id="rp-confirm"
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
