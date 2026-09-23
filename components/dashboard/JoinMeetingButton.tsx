"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconVideo } from "@/components/icons";
import { useToast } from "@/components/Toast";

export default function JoinMeetingButton({
  room,
  displayName,
  subject,
  label,
  className = "",
  lobby = false,
  logOnLeave = false,
}: {
  room: string;
  displayName: string;
  subject: string;
  label?: string;
  className?: string;
  lobby?: boolean;
  // When true, leaving the room returns to this page with ?openLog=<room>
  // so it can auto-open the matching "log this session" form. Only
  // meaningful for teacher-initiated joins of a real booking/group room.
  logOnLeave?: boolean;
}) {
  const { showToast } = useToast();
  const t = useTranslations("Dashboard.common");
  const pathname = usePathname();

  const params = new URLSearchParams({ name: displayName, subject, return: pathname });
  if (lobby) params.set("lobby", "1");
  if (logOnLeave) params.set("log", "1");
  const href = `/dashboard/room/${encodeURIComponent(room)}?${params.toString()}`;

  return (
    <Link
      href={href}
      onClick={() => showToast(t("joiningToast"), "success")}
      className={`flex items-center gap-2 rounded-pill bg-gold-gradient px-4 py-2 text-xs font-bold text-white shadow-soft transition-transform active:scale-95 ${className}`}
    >
      <IconVideo className="h-4 w-4" aria-hidden="true" />
      {label ?? t("joinLesson")}
    </Link>
  );
}
