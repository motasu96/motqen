"use client";

import Link from "next/link";
import { IconVideo } from "@/components/icons";
import { useToast } from "@/components/Toast";

export default function JoinMeetingButton({
  room,
  displayName,
  subject,
  label = "الانضمام للحصة",
  className = "",
}: {
  room: string;
  displayName: string;
  subject: string;
  label?: string;
  className?: string;
}) {
  const { showToast } = useToast();

  const params = new URLSearchParams({ name: displayName, subject });
  const href = `/dashboard/room/${encodeURIComponent(room)}?${params.toString()}`;

  return (
    <Link
      href={href}
      onClick={() => showToast("جارٍ فتح غرفة الحصة...", "success")}
      className={`flex items-center gap-2 rounded-pill bg-gold-gradient px-4 py-2 text-xs font-bold text-white shadow-soft transition-transform active:scale-95 ${className}`}
    >
      <IconVideo className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
