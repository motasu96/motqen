import { Alert, Linking } from "react-native";

// The administration's WhatsApp number (international format, digits only)
// — same number the website uses. Private lessons are paid, but prices and
// payment methods are only ever given over WhatsApp, never charged in-app.
export const ADMIN_WHATSAPP_NUMBER = "970567841689";

// Turns a phone number typed in any common international form
// ("+970 59-912 3456", "00970599123456", "970599123456") into the
// digits-only form wa.me expects. Returns null for anything that isn't a
// plausible international number (e.g. a local number starting with 0).
export function normalizeWhatsAppNumber(input: string): string | null {
  const digits = input.trim().replace(/[\s\-().]/g, "").replace(/^\+/, "").replace(/^00/, "");
  return /^[1-9][0-9]{7,14}$/.test(digits) ? digits : null;
}

export function openWhatsApp(number: string, text?: string) {
  const url = `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return Linking.openURL(url).catch(() => {
    Alert.alert("تعذّر فتح واتساب", `يمكنك التواصل مباشرة على الرقم +${number}`);
  });
}
