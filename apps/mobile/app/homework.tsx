import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useAuth } from "../lib/auth";
import { HomeworkRow, listStudentHomework, markHomeworkSubmitted } from "../lib/homework";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

const TYPE_LABELS: Record<string, string> = { recitation: "تلاوة", review: "مراجعة", tajweed: "تجويد" };
const STATUS_LABELS: Record<string, string> = { pending: "بانتظار التسليم", submitted: "تم التسليم", graded: "تم التصحيح" };
const STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  pending: "time-outline",
  submitted: "checkmark-circle-outline",
  graded: "ribbon-outline",
};

export default function HomeworkScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="document-text-outline" size={40} color={colors.line} />
              <Text style={styles.empty}>لا توجد واجبات حاليًا</Text>
            </View>
          }
          renderItem={({ item: h }) => (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{TYPE_LABELS[h.type] ?? h.type}</Text>
                </View>
                <Text style={styles.title}>{h.title}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.inkSoft} />
                <Text style={styles.meta}>تاريخ التسليم: {h.due_date}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name={STATUS_ICONS[h.status] ?? "ellipse-outline"} size={13} color={colors.inkSoft} />
                <Text style={styles.meta}>{STATUS_LABELS[h.status] ?? h.status}</Text>
              </View>
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

function getStyles(colors: Palette) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  emptyWrap: { alignItems: "center", marginTop: 60, gap: 10 },
  empty: { textAlign: "center", color: colors.inkSoft, fontFamily: fonts.regular },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 4, ...shadow.soft },
  // "flex-start" packs to the physical right here (RTL auto-mirror).
  headerRow: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 8, marginBottom: 4 },
  badge: { backgroundColor: colors.goldLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldDark },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: "right" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-start" },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  grade: { fontFamily: fonts.bold, fontSize: 13, color: colors.goldDark, textAlign: "right", marginTop: 4 },
  button: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 13 },
  });
}
