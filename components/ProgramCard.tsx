import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Program } from "@/data/programs";
import { localize } from "@/lib/localize";

export default function ProgramCard({ program }: { program: Program }) {
  const locale = useLocale();
  const t = useTranslations("Programs");
  const p = localize(program, locale);

  return (
    <div className="card-interactive relative flex flex-col gap-4 p-6">
      {program.featured && (
        <span className="badge absolute right-9 top-9 z-10">{t("mostRequested")}</span>
      )}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
        <Image
          src={program.image}
          alt={p.title}
          fill
          sizes="(min-width: 1024px) 380px, 90vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-extrabold text-ink">{p.title}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">{p.short}</p>
      </div>
      <Link
        href={`/programs/${program.slug}`}
        className="mt-auto flex items-center gap-1.5 text-sm font-bold text-gold-dark hover:gap-2.5 transition-all"
      >
        {t("viewDetails")}
        <span aria-hidden>‹</span>
      </Link>
    </div>
  );
}
