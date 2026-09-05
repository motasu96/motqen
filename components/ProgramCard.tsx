import Link from "next/link";
import Image from "next/image";
import { Program } from "@/data/programs";

export default function ProgramCard({ program }: { program: Program }) {
  return (
    <div className="card-interactive relative flex flex-col gap-4 p-6">
      {program.featured && (
        <span className="badge absolute right-9 top-9 z-10">الأكثر طلبًا</span>
      )}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
        <Image
          src={program.image}
          alt={program.title}
          fill
          sizes="(min-width: 1024px) 380px, 90vw"
          className="object-cover"
        />
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
