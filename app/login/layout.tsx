import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | متقن",
  description: "سجّل الدخول إلى حسابك في مقرأة متقن لمتابعة رحلتك في تعلم القرآن الكريم.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
