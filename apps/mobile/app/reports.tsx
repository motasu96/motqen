import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useAuth } from "../lib/auth";
import { getAttendanceStats } from "../lib/lessons";
import { listStudentHomework } from "../lib/homework";
import { listStudentMemorization } from "../lib/memorization";
import { getMyStudentProfile } from "../lib/studentProfile";
import { buildPlan, overallProgressPercent, weekIndexForDate } from "../lib/quranPlan";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

const GRADE_RE = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/;

function weeksAgoBucket(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7) return 3;
  if (days < 14) return 2;
  if (days < 21) return 1;
  if (days < 28) return 0;
  return -1;
}

export default function ReportsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const userId = session?.user?.id;

  const [ready, setReady] = useState(false);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [homeworkPercent, setHomeworkPercent] = useState(0);
  const [avgGrade, setAvgGrade] = useState<number | null>(null);
  const [memorizationPercent, setMemorizationPercent] = useState(0);
  const [weeklyPages, setWeeklyPages] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [attendance, homework, records, { student }] = await Promise.all([
        getAttendanceStats(userId),
        listStudentHomework(userId),
        listStudentMemorization(userId),
        getMyStudentProfile(userId),
      ]);
      if (cancelled) return;

      setAttendancePercent(attendance.percent);

      const doneHomework = homework.filter((h) => h.status !== "pending");
      setHomeworkPercent(homework.length > 0 ? Math.round((doneHomework.length / homework.length) * 100) : 0);

      const grades = homework
        .map((h) => (h.grade ? h.grade.match(GRADE_RE) : null))
        .filter((m): m is RegExpMatchArray => Boolean(m))
        .map((m) => (Number(m[1]) / Number(m[2])) * 100);
      setAvgGrade(grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null);

      if (student?.plan_duration_months) {
        const plan = buildPlan({
          durationMonths: student.plan_duration_months,
          alreadyMemorizedJuz: student.already_memorized_juz,
          reviewDaysPerWeek: (student.review_days_per_week === 2 ? 2 : 1) as 1 | 2,
          direction: student.plan_direction === "fromStart" ? "fromStart" : "fromEnd",
        });
        const weekIndex = weekIndexForDate(plan, new Date(student.created_at), new Date());
        setMemorizationPercent(overallProgressPercent(plan, weekIndex));
      }

      const buckets = [0, 0, 0, 0];
      for (const r of records) {
        const b = weeksAgoBucket(r.completed_date);
        if (b >= 0) buckets[b] += r.pages;
      }
      setWeeklyPages(buckets);

      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const STATS = [
    { label: "نسبة الحضور", value: attendancePercent, hasValue: true, icon: "checkmark-done-outline" as const },
    { label: "إنجاز الواجبات", value: homeworkPercent, hasValue: true, icon: "document-text-outline" as const },
    { label: "متوسط الدرجات", value: avgGrade ?? 0, hasValue: avgGrade !== null, icon: "trophy-outline" as const },
    { label: "إجمالي الحفظ", value: memorizationPercent, hasValue: true, icon: "book-outline" as const },
  ];
  const maxPages = Math.max(1, ...weeklyPages);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "التقارير" }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {!ready ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              {STATS.map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <View style={styles.statIconBubble}>
                    <Ionicons name={s.icon} size={18} color={colors.goldDark} />
                  </View>
                  <Text style={styles.statValue}>{s.hasValue ? `${s.value}%` : "—"}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="bar-chart-outline" size={18} color={colors.goldDark} />
                <Text style={styles.chartTitle}>الصفحات المحفوظة أسبوعيًا</Text>
              </View>
              {weeklyPages.map((pages, i) => (
                <View key={i} style={styles.barRow}>
                  <Text style={styles.barLabel}>الأسبوع {i + 1}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(pages / maxPages) * 100}%` }]} />
                  </View>
                  <Text style={styles.barValue}>{pages} صفحة</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flexBasis: "47%",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
    ...shadow.soft,
  },
  statIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  statValue: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.goldDark, textAlign: "right" },
  statLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  chartCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: colors.line, gap: 12, ...shadow.soft },
  chartHeader: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-start" },
  chartTitle: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  barLabel: { width: 64, fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  barTrack: { flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.bg, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.gold },
  barValue: { width: 56, fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "left" },
  });
}
