"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const t = useTranslations("Login");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string) ?? "";
    const password = (new FormData(form).get("password") as string) ?? "";

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setLoading(true);
      setTimeout(() => {
        showToast(t("toastSuccess"), "success");
        router.push(role === "student" ? "/dashboard/student" : "/dashboard/teacher");
      }, 500);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoading(false);
      showToast(t("errorInvalidCredentials"), "error");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (!profile || (profile.role !== "student" && profile.role !== "teacher")) {
      await supabase.auth.signOut();
      setLoading(false);
      showToast(t("errorInvalidCredentials"), "error");
      return;
    }

    setLoading(false);
    showToast(t("toastSuccess"), "success");
    router.push(profile.role === "student" ? "/dashboard/student" : "/dashboard/teacher");
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="mt-2 text-2xl font-extrabold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-soft">{t("subtitle")}</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1" role="group" aria-label={t("roleGroupLabel")}>
          {(
            [
              { key: "student", label: t("roleStudent") },
              { key: "teacher", label: t("roleTeacher") },
            ] as const
          ).map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              aria-pressed={role === r.key}
              className={`rounded-pill py-2.5 text-sm font-bold transition-colors ${
                role === r.key ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-bold text-ink">{t("emailLabel")}</label>
            <input id="login-email" name="email" required type="email" dir="ltr" className="input" placeholder="example@email.com" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-bold text-ink">{t("passwordLabel")}</label>
              <Link href="/forgot-password" className="text-xs font-bold text-gold-dark">{t("forgotPassword")}</Link>
            </div>
            <input id="login-password" name="password" required type="password" className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-70">
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-bold text-gold-dark">
            {t("createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
