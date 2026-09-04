import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المقالات | متقن",
  description: "مقالات تربوية وشرعية منوّعة في تعليم القرآن الكريم وحفظه وتجويده.",
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
