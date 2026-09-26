import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { useAuth } from "../../lib/auth";
import { buildJitsiUrl } from "../../lib/jitsi";
import { colors } from "../../lib/theme";

export default function RoomScreen() {
  const { room } = useLocalSearchParams<{ room: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const displayName = session?.user?.email ?? "طالب";
  const url = buildJitsiUrl(room, displayName);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.leaveButton} onPress={() => router.back()}>
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
          // Auto-grants the page's own camera/mic getUserMedia() request on Android.
          mediaCapturePermissionGrantType="grant"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#2E2418" },
  topBar: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 50,
    paddingBottom: 8,
  },
  leaveButton: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  leaveButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  webview: { flex: 1 },
});
