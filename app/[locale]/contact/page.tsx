"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Breadcrumb } from "@/components/ui";
import { IconMail, IconMapPin, IconPhone } from "@/components/icons";
import { useToast } from "@/components/Toast";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();
  const t = useTranslations("Contact");
  const tNav = useTranslations("Nav");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    showToast(t("toastSuccess"), "success");
  }

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("contact") }]} />

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="max-w-xl text-ink-soft">{t("description")}</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <div className="card flex items-center gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light" aria-hidden="true">
              <IconMail className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <div className="text-sm text-ink-soft">{t("emailLabel")}</div>
              <div dir="ltr" className="font-bold text-ink">info@motqen.site</div>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light" aria-hidden="true">
              <IconPhone className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <div className="text-sm text-ink-soft">{t("phoneLabel")}</div>
              <div dir="ltr" className="font-bold text-ink">+966 50 123 4567</div>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light" aria-hidden="true">
              <IconMapPin className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <div className="text-sm text-ink-soft">{t("addressLabel")}</div>
              <div className="font-bold text-ink">{t("addressValue")}</div>
            </div>
          </div>
        </div>

        <div className="card p-7 sm:p-9">
          {sent ? (
            <div className="animate-fade-up flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-light">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-gold-dark" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12.5 9 17.5 20 6.5" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-ink">{t("successTitle")}</h3>
              <p className="text-sm text-ink-soft">{t("successDesc")}</p>
              <button onClick={() => setSent(false)} className="btn-outline mt-2">
                {t("sendAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">{t("formTitle")}</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-name" className="text-sm font-bold text-ink">{t("nameLabel")}</label>
                  <input id="contact-name" required className="input" placeholder={t("namePlaceholder")} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-phone" className="text-sm font-bold text-ink">{t("phoneLabel")}</label>
                  <input id="contact-phone" required dir="ltr" className="input" placeholder={t("phonePlaceholder")} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="text-sm font-bold text-ink">{t("emailLabel")}</label>
                <input id="contact-email" required type="email" dir="ltr" className="input" placeholder={t("emailPlaceholder")} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="text-sm font-bold text-ink">{t("messageLabel")}</label>
                <textarea id="contact-message" required rows={5} className="input resize-none" placeholder={t("messagePlaceholder")} />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-fit">
                {t("submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
