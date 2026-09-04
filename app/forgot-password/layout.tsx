import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور | متقن",
  description: "أدخل بريدك الإلكتروني المسجّل وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
