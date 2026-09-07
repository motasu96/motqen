"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { IconShield } from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast("تم تسجيل الدخول بنجاح، مرحبًا بعودتك.", "success");
      router.push("/dashboard/admin");
    }, 500);
  }

  return (
    <div className="container-page flex min-h-screen items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-light">
            <IconShield className="h-5 w-5 text-gold-dark" />
          </span>
          <h1 className="text-2xl font-extrabold text-ink">دخول مدير المشروع</h1>
          <p className="text-sm text-ink-soft">هذه البوابة مخصصة لفريق إدارة منصة متقن فقط</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-login-email" className="text-sm font-bold text-ink">البريد الإلكتروني</label>
            <input id="admin-login-email" required type="email" dir="ltr" className="input" placeholder="admin@motqen.com" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-login-password" className="text-sm font-bold text-ink">كلمة المرور</label>
            <input id="admin-login-password" required type="password" className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-70">
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
