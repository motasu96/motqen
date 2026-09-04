"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Logo from "@/components/Logo";
import { IconCheck } from "@/components/icons";
import { useToast } from "@/components/Toast";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    showToast("تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.", "success");
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        {sent ? (
          <div key="sent" className="animate-fade-up flex flex-col items-center gap-3 text-center">
            <div className="mb-2 flex flex-col items-center gap-3">
              <Logo />
              <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-gold-light" aria-hidden="true">
                <IconCheck className="h-7 w-7 text-gold-dark" />
              </span>
              <h1 className="text-2xl font-extrabold text-ink">تحقق من بريدك الإلكتروني</h1>
              <p className="text-sm text-ink-soft">
                أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني، اتبع التعليمات فيه لإعادة تعيين كلمة المرور.
              </p>
            </div>
            <Link href="/login" className="btn-primary w-full">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <div key="form" className="animate-fade-up">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <Logo />
              <h1 className="mt-2 text-2xl font-extrabold text-ink">نسيت كلمة المرور؟</h1>
              <p className="text-sm text-ink-soft">
                أدخل بريدك الإلكتروني المسجّل وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="fp-email" className="text-sm font-bold text-ink">البريد الإلكتروني</label>
                <input id="fp-email" required type="email" dir="ltr" className="input" placeholder="example@email.com" />
              </div>
              <button type="submit" className="btn-primary mt-2 w-full">
                إرسال رابط إعادة التعيين
              </button>
              <Link href="/login" className="mt-2 text-center text-sm font-bold text-ink-soft hover:text-gold-dark">
                العودة لتسجيل الدخول
              </Link>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
