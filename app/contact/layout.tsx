import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تواصل معنا | متقن",
  description: "يسعدنا استقبال استفساراتكم وملاحظاتكم، فريقنا جاهز للرد عليكم في أقرب وقت.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
