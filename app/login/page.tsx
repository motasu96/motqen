"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push(role === "student" ? "/dashboard/student" : "/dashboard/teacher");
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

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1">
          {(
            [
              { key: "student", label: "طالب" },
              { key: "teacher", label: "معلم" },
            ] as const
          ).map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
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
            <label className="text-sm font-bold text-ink">البريد الإلكتروني</label>
            <input required type="email" dir="ltr" className="input" placeholder="example@email.com" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-ink">كلمة المرور</label>
              <Link href="#" className="text-xs font-bold text-gold-dark">نسيت كلمة المرور؟</Link>
            </div>
            <input required type="password" className="input" placeholder="••••••••" />
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
