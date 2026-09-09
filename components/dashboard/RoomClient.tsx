"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { IconX } from "@/components/icons";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiMeetAPI;
  }
}

type JitsiMeetAPI = {
  dispose: () => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  addEventListener: (event: string, handler: () => void) => void;
};

const JITSI_DOMAIN = "meet.motqen.site";

function sanitizeRoomName(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
  return `motqen-${cleaned || "lesson"}`;
}

export default function RoomClient({
  room,
  displayName,
  subject,
  enableLobby,
}: {
  room: string;
  displayName: string;
  subject: string;
  enableLobby?: boolean;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetAPI | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    function init() {
      if (cancelled || !containerRef.current || apiRef.current || !window.JitsiMeetExternalAPI) return;
      const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: sanitizeRoomName(room),
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        lang: "ar",
        userInfo: { displayName },
        configOverwrite: { prejoinPageEnabled: true, disableDeepLinking: true, defaultLanguage: "ar" },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, MOBILE_APP_PROMO: false },
      });
      api.executeCommand("subject", subject);
      api.addEventListener("readyToClose", () => router.back());
      if (enableLobby) {
        api.addEventListener("videoConferenceJoined", () => {
          api.executeCommand("toggleLobby", true);
        });
      }
      apiRef.current = api;
    }

    if (window.JitsiMeetExternalAPI) {
      init();
    } else {
      pollTimer = setInterval(() => {
        if (window.JitsiMeetExternalAPI) {
          if (pollTimer) clearInterval(pollTimer);
          init();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [room, displayName, subject, enableLobby, router]);

  return (
    <>
      <Script src={`https://${JITSI_DOMAIN}/external_api.js`} strategy="afterInteractive" />
      <div className="flex h-screen flex-col bg-ink">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#FBF7EE] px-3 py-1.5 text-sm font-extrabold text-gold-dark">مُتقن</span>
            {enableLobby && (
              <span className="rounded-pill bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
                غرفة محمية — يلزم موافقتك لإدخال الطلاب
              </span>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-pill bg-white/10 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
          >
            <IconX className="h-4 w-4" aria-hidden="true" />
            مغادرة الغرفة
          </button>
        </div>
        <div ref={containerRef} className="flex-1" />
      </div>
    </>
  );
}
