export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 text-gold-dark" fill="none">
        <path
          d="M20 3c9.4 0 17 7.6 17 17s-7.6 17-17 17S3 29.4 3 20 10.6 3 20 3Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M14 27V13c3.6-1.4 7.2-1.4 12 .7v13.6c-4.8-2.1-8.4-2.1-12-.9Z" fill="currentColor" opacity="0.15" />
        <path d="M14 27V13c3.6-1.4 7.2-1.4 12 .7v13.6c-4.8-2.1-8.4-2.1-12-.9Z" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="20" cy="9.5" r="1.1" fill="currentColor" />
      </svg>
      <div className="leading-tight">
        <div className="text-lg font-extrabold text-ink">متقن</div>
        <div className="text-[11px] font-medium text-ink-soft">مقرأة القرآن الكريم</div>
      </div>
    </div>
  );
}
