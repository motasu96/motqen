export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="38" height="38" rx="11" fill="#F1E3C4" />
        <rect x="1" y="1" width="38" height="38" rx="11" stroke="#C89B4A" strokeOpacity="0.35" />
        <path
          d="M20,5 L22.37,14.27 L30.61,9.39 L25.73,17.63 L35,20 L25.73,22.37 L30.61,30.61 L22.37,25.73 L20,35 L17.63,25.73 L9.39,30.61 L14.27,22.37 L5,20 L14.27,17.63 L9.39,9.39 L17.63,14.27 Z"
          fill="none"
          stroke="#A97F32"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="20" r="4.2" fill="#A97F32" />
        <circle cx="21.8" cy="18.6" r="3.4" fill="#F1E3C4" />
      </svg>
      <div className="leading-tight">
        <div className="text-lg font-extrabold text-ink">متقن</div>
        <div className="text-[11px] font-medium text-ink-soft">مقرأة القرآن الكريم</div>
      </div>
    </div>
  );
}
