// Mirrors sanitizeRoomName() in the web app's RoomClient.tsx so a group's
// UUID always maps to the exact same Jitsi room on both platforms.
export const JITSI_DOMAIN = "meet.jit.si";

export function sanitizeRoomName(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
  return `motqen-${cleaned || "lesson"}`;
}

export function buildJitsiUrl(room: string, displayName: string) {
  const roomName = sanitizeRoomName(room);
  // Jitsi's URL-hash config parser reads string values as quoted JS literals
  // (e.g. userInfo.displayName="Jane") — an unquoted value is silently
  // dropped, which is why the display name wasn't showing up.
  const quotedName = encodeURIComponent(`"${displayName.replace(/"/g, '\\"')}"`);
  const config = [
    "config.prejoinPageEnabled=true",
    "config.disableDeepLinking=true",
    `userInfo.displayName=${quotedName}`,
    "interfaceConfig.SHOW_JITSI_WATERMARK=false",
    "interfaceConfig.MOBILE_APP_PROMO=false",
  ].join("&");
  return `https://${JITSI_DOMAIN}/${roomName}#${config}`;
}
