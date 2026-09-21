"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { IconShield } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const t = useTranslations("AdminLogin");
  const tLogin = useTranslations("Login");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string) ?? "";
    const password = (new FormData(form).get("password") as string) ?? "";
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setLoading(false);
      showToast(t("errorInvalidCredentials"), "error");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      showToast(t("errorNotAdmin"), "error");
      return;
    }

    showToast(tLogin("toastSuccess"), "success");
    router.push("/dashboard/admin");
  }

  return (
    <div className="container-page flex min-h-screen items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
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
            <label htmlFor="admin-login-email" className="text-sm font-bold text-ink">{tLogin("emailLabel")}</label>
            <input id="admin-login-email" name="email" required type="email" dir="ltr" className="input" placeholder="admin@motqen.site" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-login-password" className="text-sm font-bold text-ink">{tLogin("passwordLabel")}</label>
            <input id="admin-login-password" name="password" required type="password" className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-70">
            {loading ? tLogin("submitting") : tLogin("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
