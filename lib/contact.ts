// The administration's WhatsApp number (international format, digits only),
// used by every "contact us on WhatsApp" link on the site — including the
// private-lesson pricing links, since prices and payment methods are only
// ever given over WhatsApp, never charged on the site.
export const ADMIN_WHATSAPP_NUMBER = "970567841689";

// Turns a phone number typed in any common international form
// ("+970 59-912 3456", "00970599123456", "970599123456") into the
// digits-only form wa.me expects. Returns null for anything that isn't a
// plausible international number — notably a local number starting with
// 0, which wa.me can't route without a country code.
export function normalizeWhatsAppNumber(input: string): string | null {
  const digits = input.trim().replace(/[\s\-().]/g, "").replace(/^\+/, "").replace(/^00/, "");
  return /^[1-9][0-9]{7,14}$/.test(digits) ? digits : null;
}

export function whatsappHref(number: string, text?: string) {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
