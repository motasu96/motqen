import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "التسجيل والاشتراك | متقن",
  description: "اختر البرنامج المناسب وابدأ رحلتك في تعلم القرآن الكريم مع متقن.",
  robots: { index: false, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
