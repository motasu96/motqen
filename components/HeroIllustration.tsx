export default function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="مصحف القرآن الكريم موضوع على رحل خشبي أمام محراب"
    >
      <defs>
        <linearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF7EE" />
          <stop offset="100%" stopColor="#F1E3C4" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9C7A4A" />
          <stop offset="100%" stopColor="#6E5232" />
        </linearGradient>
        <linearGradient id="coverGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8A6B2E" />
          <stop offset="100%" stopColor="#5B441F" />
        </linearGradient>
      </defs>

      {/* Arched niche */}
      <path
        d="M120 360V190c0-44 35.8-80 80-80s80 36 80 80v170Z"
        fill="url(#archGrad)"
        stroke="#EDE3CD"
        strokeWidth="2"
      />
      <path
        d="M140 360V192c0-33.1 26.9-60 60-60s60 26.9 60 60v168"
        fill="none"
        stroke="#C89B4A"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />
      {/* subtle radiating pattern inside the arch */}
      <g stroke="#C89B4A" strokeOpacity="0.16" strokeWidth="1">
        <path d="M200 130v230" />
        <path d="M165 145l70 215" />
        <path d="M235 145l-70 215" />
        <path d="M150 170l100 190" />
        <path d="M250 170l-100 190" />
      </g>

      {/* Ledge under the arch */}
      <rect x="108" y="352" width="184" height="10" rx="3" fill="#EDE3CD" />

      {/* Small vase with a branch, to the right */}
      <g>
        <path d="M300 340c-10 0-17-7-17-15 0-9 6-19 17-30 11 11 17 21 17 30 0 8-7 15-17 15Z" fill="#FFFFFF" stroke="#EDE3CD" strokeWidth="1.4" />
        <rect x="286" y="338" width="28" height="16" rx="4" fill="#FFFFFF" stroke="#EDE3CD" strokeWidth="1.4" />
        <path d="M300 296c0-18-6-30-14-38" fill="none" stroke="#8FA37E" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M300 300c4-14 12-23 22-28" fill="none" stroke="#8FA37E" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="285" cy="258" r="5" fill="#A9BF97" />
        <circle cx="278" cy="270" r="4" fill="#8FA37E" />
        <circle cx="323" cy="272" r="4.5" fill="#A9BF97" />
        <circle cx="329" cy="284" r="3.6" fill="#8FA37E" />
      </g>

      {/* Wooden rehal (X stand) */}
      <g>
        <path d="M148 356 L252 296 L262 302 L158 362 Z" fill="url(#woodGrad)" />
        <path d="M252 356 L148 296 L138 302 L242 362 Z" fill="url(#woodGrad)" />
        <ellipse cx="200" cy="358" rx="70" ry="7" fill="#2E2418" opacity="0.08" />
      </g>

      {/* Book resting on the stand */}
      <g>
        {/* page block edge */}
        <path d="M150 300 L200 276 L250 300 L250 310 L200 286 L150 310 Z" fill="#FBF7EE" stroke="#EDE3CD" strokeWidth="1.2" />
        {/* left cover */}
        <path d="M150 300 L198 278 L198 224 L150 246 Z" fill="url(#coverGrad)" />
        <path d="M158 296 L192 280 L192 232 L158 248 Z" fill="none" stroke="#F1E3C4" strokeOpacity="0.55" strokeWidth="1.2" />
        {/* right cover */}
        <path d="M250 300 L202 278 L202 224 L250 246 Z" fill="url(#coverGrad)" />
        <path d="M242 296 L208 280 L208 232 L242 248 Z" fill="none" stroke="#F1E3C4" strokeOpacity="0.55" strokeWidth="1.2" />
        {/* spine */}
        <path d="M198 224 L202 224 L202 278 L198 278 Z" fill="#4A3719" />
        {/* central medallion ornament */}
        <g transform="translate(200 250)">
          <path
            d="M0,-12 L2.8,-6.5 L9,-8 L4.6,-3 L11,0 L4.6,3 L9,8 L2.8,6.5 L0,12 L-2.8,6.5 L-9,8 L-4.6,3 L-11,0 L-4.6,-3 L-9,-8 L-2.8,-6.5 Z"
            fill="none"
            stroke="#F1E3C4"
            strokeOpacity="0.8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle r="2.2" fill="#F1E3C4" fillOpacity="0.85" />
        </g>
      </g>
    </svg>
  );
}
