import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useAuth } from "../lib/auth";
import { ExamRow, listStudentExams } from "../lib/examsCertificates";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

const EXAM_STATUS_LABELS: Record<string, string> = { upcoming: "قادم", completed: "منتهي" };

export default function ExamsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const userId = session?.user?.id;
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const rows = await listStudentExams(userId);
      if (cancelled) return;
      setExams(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "الاختبارات" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          {exams.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="clipboard-outline" size={40} color={colors.line} />
              <Text style={styles.empty}>لا توجد اختبارات مسجّلة</Text>
            </View>
          ) : (
            exams.map((e) => (
              <View key={e.id} style={styles.card}>
                <Text style={styles.title}>{e.title}</Text>
                <Text style={styles.meta}>
                  {e.exam_date} · {EXAM_STATUS_LABELS[e.status] ?? e.status}
                </Text>
                {e.status === "completed" && e.score !== null && (
                  <Text style={styles.grade}>
                    الدرجة: {e.score} / {e.max_score}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
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
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 3, ...shadow.soft },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: "right" },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  grade: { fontFamily: fonts.bold, fontSize: 13, color: colors.goldDark, textAlign: "right", marginTop: 4 },
  });
}
