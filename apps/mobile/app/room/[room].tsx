import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { useAuth } from "../../lib/auth";
import { getMyStudentProfile } from "../../lib/studentProfile";
import { buildJitsiUrl } from "../../lib/jitsi";
import { fonts } from "../../lib/theme";

export default function RoomScreen() {
  const { room } = useLocalSearchParams<{ room: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = session?.user?.id;

  const [displayName, setDisplayName] = useState(session?.user?.email ?? "طالب");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { fullName } = await getMyStudentProfile(userId);
      if (!cancelled && fullName) setDisplayName(fullName);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const url = buildJitsiUrl(room, displayName);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.leaveButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="exit-outline" size={16} color="#fff" />
            <Text style={styles.leaveButtonText}>مغادرة</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: url }}
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
