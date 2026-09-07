"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const ROLE_ROUTES: Record<typeof role, string> = {
    student: "/dashboard/student",
    teacher: "/dashboard/teacher",
    admin: "/dashboard/admin",
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast("تم تسجيل الدخول بنجاح، مرحبًا بعودتك.", "success");
      router.push(ROLE_ROUTES[role]);
    }, 500);
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="mt-2 text-2xl font-extrabold text-ink">تسجيل الدخول</h1>
          <p className="text-sm text-ink-soft">مرحبًا بعودتك، سجّل الدخول لمتابعة رحلتك مع القرآن الكريم</p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 rounded-pill border border-line bg-bg p-1" role="group" aria-label="نوع الحساب">
          {(
            [
              { key: "student", label: "طالب" },
              { key: "teacher", label: "معلم" },
              { key: "admin", label: "مدير" },
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
            <label htmlFor="login-email" className="text-sm font-bold text-ink">البريد الإلكتروني</label>
            <input id="login-email" required type="email" dir="ltr" className="input" placeholder="example@email.com" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-bold text-ink">كلمة المرور</label>
              <Link href="/forgot-password" className="text-xs font-bold text-gold-dark">نسيت كلمة المرور؟</Link>
            </div>
            <input id="login-password" required type="password" className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-70">
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          ليس لديك حساب؟{" "}
          <Link href="/signup" className="font-bold text-gold-dark">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
