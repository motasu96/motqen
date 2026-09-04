"use client";

import { FormEvent, useState } from "react";
import { Breadcrumb } from "@/components/ui";
import { IconMail, IconMapPin, IconPhone } from "@/components/icons";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "التواصل" }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">تواصل معنا</h1>
        <p className="max-w-xl text-ink-soft">يسعدنا استقبال استفساراتكم وملاحظاتكم، فريقنا جاهز للرد عليكم في أقرب وقت.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <div className="card flex items-center gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light">
              <IconMail className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <div className="text-sm text-ink-soft">البريد الإلكتروني</div>
              <div dir="ltr" className="font-bold text-ink">info@motqen.com</div>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light">
              <IconPhone className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <div className="text-sm text-ink-soft">رقم الجوال</div>
              <div dir="ltr" className="font-bold text-ink">+966 50 123 4567</div>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light">
              <IconMapPin className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <div className="text-sm text-ink-soft">العنوان</div>
              <div className="font-bold text-ink">الرياض، المملكة العربية السعودية</div>
            </div>
          </div>
        </div>

        <div className="card p-7 sm:p-9">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-light">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-gold-dark" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12.5 9 17.5 20 6.5" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-ink">تم إرسال رسالتك بنجاح</h3>
              <p className="text-sm text-ink-soft">سيتواصل معك فريقنا في أقرب وقت ممكن، شكرًا لتواصلك معنا.</p>
              <button onClick={() => setSent(false)} className="btn-outline mt-2">
                إرسال رسالة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">أرسل لنا رسالة</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">الاسم الكامل</label>
                  <input required className="input" placeholder="اكتب اسمك" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">رقم الجوال</label>
                  <input required dir="ltr" className="input" placeholder="05xxxxxxxx" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">البريد الإلكتروني</label>
                <input required type="email" dir="ltr" className="input" placeholder="example@email.com" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">الرسالة</label>
                <textarea required rows={5} className="input resize-none" placeholder="اكتب رسالتك هنا..." />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-fit">
                إرسال الرسالة
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
