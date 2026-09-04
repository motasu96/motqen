import Link from "next/link";
import { ComponentType } from "react";
import { Program } from "@/data/programs";
import {
  IconFamily,
  IconKids,
  IconQiraat,
  IconQuran,
  IconReview,
  IconTilawa,
  IconWomen,
} from "./icons";

const ICONS: Record<Program["icon"], ComponentType<{ className?: string }>> = {
  quran: IconQuran,
  tilawa: IconTilawa,
  review: IconReview,
  kids: IconKids,
  family: IconFamily,
  women: IconWomen,
  qiraat: IconQiraat,
};

export default function ProgramCard({ program }: { program: Program }) {
  const Icon = ICONS[program.icon];
  return (
    <div className="card-interactive relative flex flex-col gap-4 p-6">
      {program.featured && (
        <span className="badge absolute -top-3 right-6">الأكثر طلبًا</span>
      )}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-light" aria-hidden="true">
        <Icon className="h-7 w-7 text-gold-dark" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-extrabold text-ink">{program.title}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">{program.short}</p>
      </div>
      <Link
        href={`/programs/${program.slug}`}
        className="mt-auto flex items-center gap-1.5 text-sm font-bold text-gold-dark hover:gap-2.5 transition-all"
      >
        عرض التفاصيل
        <span aria-hidden>‹</span>
      </Link>
    </div>
  );
}
