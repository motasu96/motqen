import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useAuth } from "../lib/auth";
import { listStudentMemorization, MemorizationRecordRow } from "../lib/memorization";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

export default function ArchiveScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const userId = session?.user?.id;
  const [records, setRecords] = useState<MemorizationRecordRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const rows = await listStudentMemorization(userId);
      if (cancelled) return;
      setRecords(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const totalPages = records.reduce((sum, r) => sum + r.pages, 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "الأرشيف" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          style={styles.screen}
          contentContainerStyle={styles.content}
          data={records}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={
            <View style={styles.totalCard}>
              <View style={styles.iconBubble}>
                <Ionicons name="folder-outline" size={22} color={colors.goldDark} />
              </View>
              <View>
                <Text style={styles.totalValue}>{totalPages} صفحة</Text>
                <Text style={styles.totalLabel}>إجمالي ما تم حفظه</Text>
              </View>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>لا يوجد سجل حفظ بعد</Text>}
          renderItem={({ item: r }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.title}>{r.title}</Text>
                <Text style={styles.meta}>{r.pages} صفحة</Text>
              </View>
              <Text style={styles.date}>{r.completed_date}</Text>
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
  content: { padding: 20, gap: 12 },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 4,
    ...shadow.soft,
  },
  iconBubble: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  totalValue: { fontFamily: fonts.extraBold, fontSize: 20, color: colors.goldDark, textAlign: "right" },
  totalLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center", marginTop: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    ...shadow.soft,
  },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
  date: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkSoft },
  });
}
