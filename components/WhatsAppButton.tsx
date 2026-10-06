"use client";

import { useTranslations } from "next-intl";
import { ADMIN_WHATSAPP_NUMBER, whatsappHref } from "@/lib/contact";
import { IconWhatsApp } from "./icons";

export default function WhatsAppButton() {
  const t = useTranslations("WhatsApp");
  const href = whatsappHref(ADMIN_WHATSAPP_NUMBER, t("greeting"));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("ariaLabel")}
      className="fixed bottom-24 end-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_28px_-10px_rgba(37,211,102,0.6)] transition-transform hover:scale-105"
    >
      <IconWhatsApp className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
