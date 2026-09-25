"use client";

import { useEffect, useState } from "react";
import { quranQuotes } from "@/data/quranQuotes";
import { IconQuran } from "./icons";

const ROTATE_MS = 6000;

export default function QuranTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % quranQuotes.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const quote = quranQuotes[index];

  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-card/70 px-5 py-4 text-center shadow-soft backdrop-blur">
      <IconQuran className="hidden h-6 w-6 shrink-0 text-gold-dark sm:block" aria-hidden="true" />
      <div key={index} className="animate-fade-up flex min-h-[3.5rem] flex-col items-center justify-center gap-1.5">
        <p className="max-w-2xl text-sm font-bold leading-relaxed text-ink sm:text-base">{quote.text}</p>
        <span className="text-xs font-medium text-gold-dark">{quote.source}</span>
      </div>
    </div>
  );
}
