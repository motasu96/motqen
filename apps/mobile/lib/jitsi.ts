// Mirrors sanitizeRoomName() in the web app's RoomClient.tsx so a group's
// UUID always maps to the exact same Jitsi room on both platforms.
export const JITSI_DOMAIN = "meet.jit.si";

export function sanitizeRoomName(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
  return `motqen-${cleaned || "lesson"}`;
}

export function buildJitsiUrl(room: string, displayName: string) {
  const roomName = sanitizeRoomName(room);
  const config = [
    "config.prejoinPageEnabled=true",
    `userInfo.displayName=${encodeURIComponent(displayName)}`,
    "interfaceConfig.SHOW_JITSI_WATERMARK=false",
    "interfaceConfig.MOBILE_APP_PROMO=false",
  ].join("&");
  return `https://${JITSI_DOMAIN}/${roomName}#${config}`;
}
