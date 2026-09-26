import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../lib/auth";
import { HomeworkRow, listStudentHomework, markHomeworkSubmitted } from "../lib/homework";
import { colors } from "../lib/theme";

const TYPE_LABELS: Record<string, string> = { recitation: "تلاوة", review: "مراجعة", tajweed: "تجويد" };
const STATUS_LABELS: Record<string, string> = { pending: "بانتظار التسليم", submitted: "تم التسليم", graded: "تم التصحيح" };

export default function HomeworkScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [items, setItems] = useState<HomeworkRow[]>([]);
  const [ready, setReady] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const rows = await listStudentHomework(userId);
    setItems(rows);
    setReady(true);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(id: string) {
    setBusyId(id);
    const ok = await markHomeworkSubmitted(id);
    setBusyId(null);
    if (ok) await load();
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "الواجبات" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          style={styles.screen}
          contentContainerStyle={styles.content}
          data={items}
          keyExtractor={(h) => h.id}
          ListEmptyComponent={<Text style={styles.empty}>لا توجد واجبات حاليًا</Text>}
          renderItem={({ item: h }) => (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{TYPE_LABELS[h.type] ?? h.type}</Text>
                </View>
                <Text style={styles.title}>{h.title}</Text>
              </View>
              <Text style={styles.meta}>تاريخ التسليم: {h.due_date}</Text>
              <Text style={styles.meta}>{STATUS_LABELS[h.status] ?? h.status}</Text>
              {h.grade && <Text style={styles.grade}>الدرجة: {h.grade}</Text>}

              {h.status === "pending" && (
                <TouchableOpacity
                  style={styles.button}
                  disabled={busyId === h.id}
                  onPress={() => handleSubmit(h.id)}
                >
                  <Text style={styles.buttonText}>{busyId === h.id ? "..." : "تسليم الواجب"}</Text>
                </TouchableOpacity>
              )}
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
  // "flex-start" packs to the physical right here (RTL auto-mirror).
  headerRow: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 8, marginBottom: 4 },
  badge: { backgroundColor: colors.goldLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700", color: colors.goldDark },
  title: { fontSize: 15, fontWeight: "800", color: colors.ink, textAlign: "right" },
  meta: { fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  grade: { fontSize: 13, fontWeight: "700", color: colors.goldDark, textAlign: "right", marginTop: 4 },
  button: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
