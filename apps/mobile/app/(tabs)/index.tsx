import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import {
  cancelBooking,
  getMyStudentProfile,
  listUpcomingBookings,
  StudentRow,
  UpcomingBooking,
} from "../../lib/studentProfile";
import { getLatestLesson, LessonWithTeacher } from "../../lib/lessons";
import { HomeworkRow, listStudentHomework } from "../../lib/homework";
import { getStudentPrimaryTeacher } from "../../lib/teachers";
import { getProgramBySlug } from "../../lib/programs";
import { buildPlan, getWeekPlan, overallProgressPercent, weekIndexForDate } from "../../lib/quranPlan";
import { getSurahByNumber } from "../../lib/quranSurahs";
import { fonts, gradientFor, Palette, radius, shadow, useTheme } from "../../lib/theme";

const DAY_LABELS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${DAY_LABELS[d.getDay()]} ${d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}`;
}

const HOMEWORK_TYPE_LABELS: Record<string, string> = { recitation: "تلاوة", review: "مراجعة", tajweed: "تجويد" };

const MENU_ITEMS = [
  { href: "/reports", label: "التقارير", icon: "bar-chart-outline" as const },
  { href: "/lessons", label: "الحصص", icon: "time-outline" as const },
  { href: "/homework", label: "الواجبات", icon: "document-text-outline" as const },
  { href: "/exams", label: "الاختبارات", icon: "clipboard-outline" as const },
  { href: "/certificates", label: "الشهادات", icon: "ribbon-outline" as const },
  { href: "/teachers", label: "المعلمون", icon: "people-circle-outline" as const },
  { href: "/archive", label: "الأرشيف", icon: "folder-outline" as const },
  { href: "/notices", label: "الإشعارات", icon: "notifications-outline" as const },
];

export default function HomeScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const userId = session?.user?.id;

  const [fullName, setFullName] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [latestLesson, setLatestLesson] = useState<LessonWithTeacher | null>(null);
  const [recentHomework, setRecentHomework] = useState<HomeworkRow[]>([]);
  const [primaryTeacher, setPrimaryTeacher] = useState<{ id: string; name: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const [{ fullName: name, student: s }, bookings, lesson, homework, teacher] = await Promise.all([
      getMyStudentProfile(userId),
      listUpcomingBookings(userId),
      getLatestLesson(userId),
      listStudentHomework(userId),
      getStudentPrimaryTeacher(userId),
    ]);
    setFullName(name);
    setStudent(s);
    setUpcoming(bookings);
    setLatestLesson(lesson);
    setRecentHomework(homework.filter((h) => h.status !== "graded").slice(0, 2));
    setPrimaryTeacher(teacher);
    setReady(true);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel(id: string) {
    setCancellingId(id);
    const ok = await cancelBooking(id);
    setCancellingId(null);
    if (ok) setUpcoming((prev) => prev.filter((b) => b.id !== id));
  }

  const program = student?.program_slug ? getProgramBySlug(student.program_slug) : undefined;
  const displayName = fullName || "طالب متقن";
  const initial = displayName.trim().charAt(0);

  const planData = (() => {
    if (!student?.plan_duration_months) return null;
    const plan = buildPlan({
      durationMonths: student.plan_duration_months,
      alreadyMemorizedJuz: student.already_memorized_juz,
      reviewDaysPerWeek: (student.review_days_per_week === 2 ? 2 : 1) as 1 | 2,
      direction: student.plan_direction === "fromStart" ? "fromStart" : "fromEnd",
    });
    const weekIndex = weekIndexForDate(plan, new Date(student.created_at), new Date());
    const currentWeek = weekIndex ? getWeekPlan(plan, weekIndex) : undefined;
    const percent = overallProgressPercent(plan, weekIndex);
    return { plan, weekIndex, currentWeek, percent };
  })();

  function formatSurahPosition(pos: { surahNumber: number; ayahInSurah: number }) {
    const surah = getSurahByNumber(pos.surahNumber);
    return surah ? `${surah.nameAr} — آية ${pos.ayahInSurah}` : "";
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradientFor(colors)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroGreeting}>أهلًا بك،</Text>
            <Text style={styles.heroName}>{displayName}</Text>
            {program && <Text style={styles.heroProgram}>{program.title}</Text>}
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </LinearGradient>

        {!ready ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 12 }} />
        ) : (
          <>
            {/* Overall memorization progress */}
            {planData && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="trending-up-outline" size={18} color={colors.goldDark} />
                  <Text style={styles.cardLabel}>نسبة تقدّم الحفظ الكلية</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${planData.percent}%` }]} />
                </View>
                <Text style={styles.progressPercent}>{planData.percent}%</Text>
              </View>
            )}

            {/* Today's portion */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="book-outline" size={18} color={colors.goldDark} />
                <Text style={styles.cardLabel}>ورد اليوم</Text>
              </View>
              {planData ? (
                planData.weekIndex ? (
                  <>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        الأسبوع {planData.weekIndex} من {planData.plan.totalWeeks}
                      </Text>
                    </View>
                    {planData.currentWeek && (
                      <Text style={styles.cardDesc}>
                        {formatSurahPosition(planData.currentWeek.fromPosition)} إلى{" "}
                        {formatSurahPosition(planData.currentWeek.toPosition)}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.cardTitle}>أكملت خطة الحفظ 🎉</Text>
                )
              ) : (
                <Text style={styles.cardDesc}>لم تُحدَّد خطة حفظ بعد</Text>
              )}
            </View>

            {/* Last lesson */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="checkmark-done-outline" size={18} color={colors.goldDark} />
                <Text style={styles.cardLabel}>آخر حصة</Text>
              </View>
              {latestLesson ? (
                <>
                  <Text style={styles.cardTitle}>{latestLesson.surah}</Text>
                  <Text style={styles.cardDesc}>{latestLesson.ayah_range}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>مع {latestLesson.teacherName}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.cardDesc}>لا توجد حصص سابقة مسجّلة بعد</Text>
              )}
            </View>

            {/* Direct teacher room */}
            {primaryTeacher && (
              <TouchableOpacity
                style={styles.rowCard}
                activeOpacity={0.75}
                onPress={() => router.push(`/room/teacher-${primaryTeacher.id}`)}
              >
                <View style={[styles.iconBubble, { backgroundColor: colors.goldLight }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.goldDark} />
                </View>
                <View style={styles.rowCardText}>
                  <Text style={styles.cardTitle}>الدخول المباشر مع معلمك</Text>
                  <Text style={styles.cardDesc}>ادخل مباشرة لغرفة معلمك {primaryTeacher.name}</Text>
                </View>
                <Ionicons name="chevron-back" size={18} color={colors.inkSoft} />
              </TouchableOpacity>
            )}

            {/* Upcoming sessions */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.goldDark} />
                <Text style={styles.cardLabel}>حصصك القادمة</Text>
              </View>
              {upcoming.length === 0 ? (
                <Text style={styles.cardDesc}>لا توجد حصص فردية محجوزة قريبًا</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {upcoming.map((b) => (
                    <View key={b.id} style={styles.sessionRow}>
                      <View style={styles.rowText}>
                        <Text style={styles.sessionTitle}>
                          {formatDate(b.date)} · {b.time}
                        </Text>
                        <Text style={styles.cardDesc}>مع {b.teacherName}</Text>
                      </View>
                      <TouchableOpacity style={styles.smallJoinButton} onPress={() => router.push(`/room/${b.id}`)}>
                        <Text style={styles.smallJoinButtonText}>دخول</Text>
                      </TouchableOpacity>
                      <TouchableOpacity disabled={cancellingId === b.id} onPress={() => handleCancel(b.id)}>
                        <Text style={styles.cancelText}>إلغاء</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Homework preview */}
            {recentHomework.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="document-text-outline" size={18} color={colors.goldDark} />
                  <Text style={styles.cardLabel}>واجباتي</Text>
                </View>
                {recentHomework.map((h) => (
                  <View key={h.id} style={styles.homeworkRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{HOMEWORK_TYPE_LABELS[h.type] ?? h.type}</Text>
                    </View>
                    <Text style={styles.cardDesc}>حتى {h.due_date}</Text>
                    <Text style={styles.cardTitle}>{h.title}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <Link href="/(tabs)/groups" asChild>
          <TouchableOpacity style={styles.rowCard} activeOpacity={0.75}>
            <View style={[styles.iconBubble, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="people-outline" size={20} color={colors.goldDark} />
            </View>
            <View style={styles.rowCardText}>
              <Text style={styles.cardTitle}>حلقاتك الجماعية</Text>
              <Text style={styles.cardDesc}>تابع حلقاتك وانضم إلى حصتك عند الموعد</Text>
            </View>
            <Ionicons name="chevron-back" size={18} color={colors.inkSoft} />
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/programs" asChild>
          <TouchableOpacity style={styles.rowCard} activeOpacity={0.75}>
            <View style={[styles.iconBubble, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="book-outline" size={20} color={colors.goldDark} />
            </View>
            <View style={styles.rowCardText}>
              <Text style={styles.cardTitle}>استكشف البرامج</Text>
              <Text style={styles.cardDesc}>الحفظ، التلاوة والتجويد، المراجعة، والإجازة بالسند</Text>
            </View>
            <Ionicons name="chevron-back" size={18} color={colors.inkSoft} />
          </TouchableOpacity>
        </Link>

        <Text style={styles.sectionTitle}>قوائمي</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <Link key={item.href} href={item.href as never} asChild>
              <TouchableOpacity style={styles.menuCard} activeOpacity={0.75}>
                <View style={styles.menuIconBubble}>
                  <Ionicons name={item.icon} size={22} color={colors.goldDark} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14, paddingBottom: 32 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  heroText: { flex: 1, gap: 2 },
  heroGreeting: { fontFamily: fonts.medium, fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "right" },
  heroName: { fontFamily: fonts.extraBold, fontSize: 20, color: "#fff", textAlign: "right" },
  heroProgram: { fontFamily: fonts.bold, fontSize: 12, color: "#fff", textAlign: "right", marginTop: 6 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginStart: 12,
  },
  avatarText: { fontFamily: fonts.extraBold, fontSize: 22, color: "#fff" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, justifyContent: "flex-start" },
  cardLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, textAlign: "right" },
  cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: "right" },
  cardDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    marginBottom: 2,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldDark },
  progressTrack: { height: 10, borderRadius: radius.pill, backgroundColor: colors.bg, overflow: "hidden", marginTop: 4 },
  progressFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.gold },
  progressPercent: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.goldDark, textAlign: "center", marginTop: 8 },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  rowCardText: { flex: 1 },
  iconBubble: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 },
  rowText: { flex: 1 },
  sessionTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, textAlign: "right" },
  smallJoinButton: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  smallJoinButtonText: { color: "#fff", fontFamily: fonts.bold, fontSize: 11 },
  cancelText: { fontFamily: fonts.bold, fontSize: 11, color: colors.danger },
  homeworkRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8, marginTop: 8 },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right", marginTop: 6 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  menuCard: {
    flexBasis: "47%",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    gap: 8,
    ...shadow.soft,
  },
  menuIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, textAlign: "center" },
  });
}
