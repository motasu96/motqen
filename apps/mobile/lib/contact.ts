import { Alert, Linking } from "react-native";

// The administration's WhatsApp number (international format, digits only)
// — same number the website uses. Private lessons are paid, but prices and
// payment methods are only ever given over WhatsApp, never charged in-app.
export const ADMIN_WHATSAPP_NUMBER = "970567841689";

export function openWhatsApp(number: string, text?: string) {
  const url = `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return Linking.openURL(url).catch(() => {
    Alert.alert("تعذّر فتح واتساب", `يمكنك التواصل مباشرة على الرقم +${number}`);
  });
}
