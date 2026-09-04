import Link from "next/link";
import { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className={`mb-10 flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start text-start"}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-2xl font-extrabold leading-snug text-ink sm:text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-2xl font-extrabold text-gold-dark sm:text-3xl">{value}</span>
      <span className="text-sm text-ink-soft">{label}</span>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-gold-dark">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-line">/</span>}
        </span>
      ))}
    </nav>
  );
}

export function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${i < Math.round(value) ? "text-gold" : "text-line"}`}
          fill="currentColor"
        >
          <path d="m12 3 2.7 5.9 6.3.7-4.7 4.4 1.3 6.3L12 17.3l-5.6 3 1.3-6.3L3 9.6l6.3-.7L12 3Z" />
        </svg>
      ))}
    </div>
  );
}
