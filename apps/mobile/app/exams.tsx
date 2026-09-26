import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../lib/auth";
import { CertificateRow, ExamRow, GRADE_LABEL_TEXT, listMyCertificates, listStudentExams } from "../lib/examsCertificates";
import { colors } from "../lib/theme";

const EXAM_STATUS_LABELS: Record<string, string> = { upcoming: "قادم", completed: "منتهي" };
const CERT_SCOPE_LABELS: Record<string, string> = { parts: "أجزاء", khatm: "ختمة كاملة" };

export default function ExamsScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [examRows, certRows] = await Promise.all([listStudentExams(userId), listMyCertificates(userId)]);
      if (cancelled) return;
      setExams(examRows);
      setCertificates(certRows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "الاختبارات والشهادات" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>الاختبارات</Text>
          {exams.length === 0 ? (
            <Text style={styles.empty}>لا توجد اختبارات مسجّلة</Text>
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

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>الشهادات</Text>
          {certificates.length === 0 ? (
            <Text style={styles.empty}>لا توجد شهادات صادرة بعد</Text>
          ) : (
            certificates.map((c) => (
              <View key={c.id} style={styles.card}>
                <Text style={styles.title}>{CERT_SCOPE_LABELS[c.scope] ?? c.scope}</Text>
                <Text style={styles.meta}>رقم الشهادة: {c.certificate_number}</Text>
                <Text style={styles.meta}>تاريخ الإصدار: {c.issued_at.slice(0, 10)}</Text>
                <Text style={styles.meta}>المعلم: {c.teacher_name}</Text>
                {c.grade_label && <Text style={styles.grade}>التقدير: {GRADE_LABEL_TEXT[c.grade_label] ?? c.grade_label}</Text>}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.ink, textAlign: "right" },
  empty: { fontSize: 13, color: colors.inkSoft, textAlign: "right" },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 3 },
  title: { fontSize: 15, fontWeight: "800", color: colors.ink, textAlign: "right" },
  meta: { fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  grade: { fontSize: 13, fontWeight: "700", color: colors.goldDark, textAlign: "right", marginTop: 4 },
});
