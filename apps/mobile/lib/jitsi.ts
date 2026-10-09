// Mirrors sanitizeRoomName() in the web app's RoomClient.tsx so a group's
// UUID always maps to the exact same Jitsi room on both platforms.
export const JITSI_DOMAIN = "meet.jit.si";

export function sanitizeRoomName(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
  return `motqen-${cleaned || "lesson"}`;
}

// Teachers join through Jitsi's External API (same as the web RoomClient)
// rather than the plain room URL, because only the API can switch the lobby
// on: students then wait until the teacher admits them. The page reports
// "leave" back to React Native through postMessage.
export function buildTeacherRoomHtml(room: string, displayName: string, subject: string) {
  const options = {
    roomName: sanitizeRoomName(room),
    width: "100%",
    height: "100%",
    userInfo: { displayName },
    configOverwrite: { prejoinPageEnabled: true, disableDeepLinking: true },
    interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, MOBILE_APP_PROMO: false },
  };
  // JSON inside a <script> block: neutralise "</" so a name can't close it.
  const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body,#meet{margin:0;height:100%;background:#2E2418}</style></head>
<body><div id="meet"></div>
<script src="https://${JITSI_DOMAIN}/external_api.js"></script>
<script>
  function post(type){ if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(type); }
  try {
    var options = ${json(options)};
    options.parentNode = document.getElementById("meet");
    var api = new JitsiMeetExternalAPI(${json(JITSI_DOMAIN)}, options);
    api.executeCommand("subject", ${json(subject)});
    api.addEventListener("videoConferenceJoined", function(){ api.executeCommand("toggleLobby", true); });
    api.addEventListener("readyToClose", function(){ post("leave"); });
    api.addEventListener("videoConferenceLeft", function(){ post("leave"); });
  } catch (e) { post("error"); }
</script></body></html>`;
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
