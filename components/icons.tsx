import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconQuran(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5c2.5-1 5-1 8 .5V19c-3-1.5-5.5-1.5-8-.5V5.5Z" />
      <path d="M20 5.5c-2.5-1-5-1-8 .5V19c3-1.5 5.5-1.5 8-.5V5.5Z" />
    </svg>
  );
}
export function IconTilawa(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11l-3-1.6-3 1.6-3-1.6-3 1.6-3-1.6Z" />
      <path d="M8 8h8M8 11.5h8" />
    </svg>
  );
}
export function IconReview(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}
export function IconKids(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  );
}
export function IconFamily(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="8.5" cy="7.5" r="2.5" />
      <circle cx="16" cy="9" r="2" />
      <path d="M3.5 20c0-3 2.2-5 5-5s5 2 5 5" />
      <path d="M13.5 20c.2-2.3 1.7-4 3.5-4 2.2 0 4 1.8 4 4" />
    </svg>
  );
}
export function IconWomen(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M12 10.2 8 14h3l-1 6h4l-1-6h3l-4-3.8Z" />
    </svg>
  );
}
export function IconQiraat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v16" />
      <path d="M5 6.5c2.3-1 4.7-1 7 0M5 11c2.3-1 4.7-1 7 0M5 15.5c2.3-1 4.7-1 7 0" />
      <path d="M19 6.5c-2.3-1-4.7-1-7 0M19 11c-2.3-1-4.7-1-7 0M19 15.5c-2.3-1-4.7-1-7 0" />
    </svg>
  );
}
export function IconShield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6v6c0 4.5 3 7.3 7 8.5 4-1.2 7-4 7-8.5V6l-7-2.5Z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.6" />
    </svg>
  );
}
export function IconCalendar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8 3.5v3M16 3.5v3" />
    </svg>
  );
}
export function IconTeacherBadge(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.5" r="3.3" />
      <path d="M6 20c.5-3.3 3-5.2 6-5.2s5.5 1.9 6 5.2" />
      <path d="m9.5 8.5 1.8 1.8L15 6.8" />
    </svg>
  );
}
export function IconPlay(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.3 9.2 15 12l-4.7 2.8V9.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconAward(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.5" r="4.5" />
      <path d="m8.3 12.5-1.4 7 5.1-2.6 5.1 2.6-1.4-7" />
    </svg>
  );
}
export function IconTarget(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
export function IconEye(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}
export function IconHeart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.5-9.3-9C1.2 7.8 3 4.5 6.5 4.5c2 0 3.5 1.2 5.5 3.2 2-2 3.5-3.2 5.5-3.2 3.5 0 5.3 3.3 3.8 6.5-2.3 4.5-9.3 9-9.3 9Z" />
    </svg>
  );
}
export function IconUsers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 19c0-3.3 2.6-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M15.5 6a3 3 0 1 1 0 5.9" />
      <path d="M17.5 13.7c2.6.5 4 2.2 4 5.3" />
    </svg>
  );
}
export function IconStar(props: IconProps) {
  return (
    <svg {...{ ...base, strokeWidth: 0 }} {...props} fill="currentColor">
      <path d="m12 3 2.7 5.9 6.3.7-4.7 4.4 1.3 6.3L12 17.3l-5.6 3 1.3-6.3L3 9.6l6.3-.7L12 3Z" />
    </svg>
  );
}
export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12.5 9 17.5 20 6.5" />
    </svg>
  );
}
export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}
export function IconX(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}
export function IconChevron(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}
export function IconPhone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h2.5L10 8l-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4.5 1.5V18a2.5 2.5 0 0 1-2.5 2.5C10.5 20.5 3.5 13.5 3.5 6A2.5 2.5 0 0 1 6 3.5Z" />
    </svg>
  );
}
export function IconMail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  );
}
export function IconMapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  );
}
export function IconClock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
export function IconHome(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </svg>
  );
}
export function IconBook(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5c2.5-1 5-1 8 .5v13c-3-1.5-5.5-1.5-8-.5V5.5ZM20 5.5c-2.5-1-5-1-8 .5v13c3-1.5 5.5-1.5 8-.5V5.5Z" />
    </svg>
  );
}
export function IconTask(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="4" width="15" height="17" rx="2.5" />
      <path d="M8.5 11.5 11 14l4.5-5" />
    </svg>
  );
}
export function IconChart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2.5 20h19" />
    </svg>
  );
}
export function IconExam(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </svg>
  );
}
export function IconBell(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5 1.5 5h-15S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}
export function IconLogout(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" />
      <path d="M16 16.5 20.5 12 16 7.5" />
      <path d="M20 12H9" />
    </svg>
  );
}
export function IconSettings(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.4a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-.8a7 7 0 0 0 2 1.2L10 21h4l.5-2.4a7 7 0 0 0 2-1.2l2.4.8 2-3.4-2-1.6c.07-.4.1-.8.1-1.2Z" />
    </svg>
  );
}
export function IconFolder(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.3h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}
export function IconMegaphone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l1 5h2l-1-5h1l9 4V6l-9 4H4a1 1 0 0 0-1 1v-1Z" />
    </svg>
  );
}
export function IconTrophy(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4a3 3 0 0 0 3 4.5M17 5.5h3a3 3 0 0 1-3 4.5" />
      <path d="M12 14v3M9 20.5h6l-.5-3.5h-5l-.5 3.5Z" />
    </svg>
  );
}
