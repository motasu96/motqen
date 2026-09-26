import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { listNoticesForStudents, NoticeRow } from "../lib/notices";
import { colors, fonts, radius, shadow } from "../lib/theme";

export default function NoticesScreen() {
  const [items, setItems] = useState<NoticeRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await listNoticesForStudents();
      if (cancelled) return;
      setItems(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "الإشعارات" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          style={styles.screen}
          contentContainerStyle={styles.content}
          data={items}
          keyExtractor={(n) => n.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={40} color={colors.line} />
              <Text style={styles.empty}>لا توجد إشعارات حاليًا</Text>
            </View>
          }
          renderItem={({ item: n }) => (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.iconBubble}>
                  <Ionicons name="notifications-outline" size={16} color={colors.goldDark} />
                </View>
                <Text style={styles.title}>{n.title}</Text>
              </View>
              <Text style={styles.body}>{n.body}</Text>
              <Text style={styles.date}>{new Date(n.created_at).toLocaleDateString("ar-EG")}</Text>
            </View>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  emptyWrap: { alignItems: "center", marginTop: 60, gap: 10 },
  empty: { textAlign: "center", color: colors.inkSoft, fontFamily: fonts.regular },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 4, ...shadow.soft },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-start" },
  iconBubble: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: "right", flex: 1 },
  body: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 19 },
  date: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
});
