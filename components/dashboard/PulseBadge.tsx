export default function PulseBadge({
  color,
  label,
  className = "",
}: {
  color: "emerald" | "red";
  label: string;
  className?: string;
}) {
  const wrapClasses =
    color === "emerald"
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
      : "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400";
  const dotClasses = color === "emerald" ? "bg-emerald-500" : "bg-red-500";

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-bold ${wrapClasses} ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotClasses} opacity-75`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClasses}`} />
      </span>
      {label}
    </span>
  );
}
