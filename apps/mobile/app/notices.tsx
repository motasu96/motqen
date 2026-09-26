import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { listNoticesForStudents, NoticeRow } from "../lib/notices";
import { colors } from "../lib/theme";

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
          ListEmptyComponent={<Text style={styles.empty}>لا توجد إشعارات حاليًا</Text>}
          renderItem={({ item: n }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{n.title}</Text>
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
  empty: { textAlign: "center", color: colors.inkSoft, marginTop: 40 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 4 },
  title: { fontSize: 15, fontWeight: "800", color: colors.ink, textAlign: "right" },
  body: { fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 19 },
  date: { fontSize: 11, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
});
