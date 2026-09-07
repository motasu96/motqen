"use client";

import { IconVideo } from "@/components/icons";
import { useToast } from "@/components/Toast";

export default function JoinMeetingButton({
  url,
  label = "الانضمام عبر Zoom",
  className = "",
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  const { showToast } = useToast();

  function handleClick() {
    showToast("جارٍ فتح غرفة الاجتماع عبر Zoom...", "success");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-pill bg-gold-gradient px-4 py-2 text-xs font-bold text-white shadow-soft transition-transform active:scale-95 ${className}`}
    >
      <IconVideo className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
