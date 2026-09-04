"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Logo from "@/components/Logo";
import { IconCheck } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          {sent ? (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
                <IconCheck className="h-7 w-7 text-gold-dark" />
              </span>
              <h1 className="mt-2 text-2xl font-extrabold text-ink">تحقق من بريدك الإلكتروني</h1>
              <p className="text-sm text-ink-soft">
                أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني، اتبع التعليمات فيه لإعادة تعيين كلمة المرور.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-2xl font-extrabold text-ink">نسيت كلمة المرور؟</h1>
              <p className="text-sm text-ink-soft">
                أدخل بريدك الإلكتروني المسجّل وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
              </p>
            </>
          )}
        </div>

        {sent ? (
          <Link href="/login" className="btn-primary w-full">
            العودة لتسجيل الدخول
          </Link>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-ink">البريد الإلكتروني</label>
              <input required type="email" dir="ltr" className="input" placeholder="example@email.com" />
            </div>
            <button type="submit" className="btn-primary mt-2 w-full">
              إرسال رابط إعادة التعيين
            </button>
            <Link href="/login" className="mt-2 text-center text-sm font-bold text-ink-soft hover:text-gold-dark">
              العودة لتسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
