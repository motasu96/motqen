import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { buildJitsiUrl, buildTeacherRoomHtml, JITSI_DOMAIN } from "../../lib/jitsi";
import { useRoomPresence } from "../../lib/presence";
import { fonts } from "../../lib/theme";

export default function RoomScreen() {
  // role=teacher (set by the teacher screens) joins through the External
  // API with the lobby on; `log=1` sends the teacher back to the home
  // screen afterwards with that session open for logging.
  const { room, role: roleParam, subject: subjectParam, log, ret } = useLocalSearchParams<{
    room: string;
    role?: string;
    subject?: string;
    log?: string;
    ret?: string;
  }>();
  const { session, role: accountRole } = useAuth();
  const asTeacher = roleParam === "teacher" && accountRole === "teacher";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = session?.user?.id;

  const [displayName, setDisplayName] = useState(session?.user?.email ?? (asTeacher ? "معلم" : "طالب"));
  const [nameReady, setNameReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
      const fullName = data?.full_name as string | null | undefined;
      if (cancelled) return;
      if (fullName) setDisplayName(fullName);
      setNameReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const url = buildJitsiUrl(room, displayName);

  useRoomPresence(room ?? null, room ? { role: asTeacher ? "teacher" : "student", name: displayName } : null);

  function leave() {
    if (asTeacher && log === "1" && room) {
      // 1:1 sessions are logged on the home screen, group circles on the
      // groups screen (the room id is the booking id / the group id).
      router.replace({ pathname: ret === "groups" ? "/(teacher)/groups" : "/(teacher)", params: { openLog: room } });
    } else {
      router.back();
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.leaveButton} onPress={leave} activeOpacity={0.8}>
            <Ionicons name="exit-outline" size={16} color="#fff" />
            <Text style={styles.leaveButtonText}>مغادرة</Text>
          </TouchableOpacity>
        </View>
        {asTeacher && !nameReady ? null : (
        <WebView
          source={
            asTeacher
              ? { html: buildTeacherRoomHtml(room, displayName, subjectParam || "حصة متقن"), baseUrl: `https://${JITSI_DOMAIN}` }
              : { uri: url }
          }
          onMessage={(e) => {
            if (e.nativeEvent.data === "leave") leave();
          }}
          style={styles.webview}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          // No extra prop needed for camera/mic: RNCWebChromeClient's
          // onPermissionRequest already checks the app's CAMERA/RECORD_AUDIO
          // manifest permissions (declared in app.json) and triggers the
          // native Android runtime-permission dialog itself when they
          // haven't been granted yet, then relays the result back to the
          // page's getUserMedia() call.
        />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#2E2418" },
  topBar: {
    // Physical top-right: with the app's Arabic locale, RN auto-mirrors
    // "flex-start" to land on the right.
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveButtonText: { color: "#fff", fontFamily: fonts.bold, fontSize: 13 },
  webview: { flex: 1 },
});
