import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import { cancelBooking, getMyStudentProfile, listUpcomingBookings, StudentRow, UpcomingBooking } from "../../lib/studentProfile";
import { getLatestLesson, LessonWithTeacher } from "../../lib/lessons";
import { HomeworkRow, listStudentHomework } from "../../lib/homework";
import { getStudentPrimaryTeacher } from "../../lib/teachers";
import { getProgramBySlug } from "../../lib/programs";
import { buildPlan, getWeekPlan, overallProgressPercent, weekIndexForDate } from "../../lib/quranPlan";
import { getSurahByNumber } from "../../lib/quranSurahs";
import { isWithinAvailableWindow, useLiveRooms, useOnlineTeacherIds } from "../../lib/presence";
import HomeDashboard, { HomePlan } from "../../components/student/HomeDashboard";
import PaidLessonsNotice from "../../components/PaidLessonsNotice";
import { useTheme } from "../../lib/theme";

function formatDate(iso: string) {
  // A SQL date is a calendar day, not midnight UTC (which shifts in some locales).
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" });
}

export default function HomeScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const userId = session?.user?.id;
  const [fullName, setFullName] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [latestLesson, setLatestLesson] = useState<LessonWithTeacher | null>(null);
  const [recentHomework, setRecentHomework] = useState<HomeworkRow[]>([]);
  const [primaryTeacher, setPrimaryTeacher] = useState<{ id: string; name: string; availableTimes: string[] } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const onlineTeacherIds = useOnlineTeacherIds();
  const liveRooms = useLiveRooms();
  const [now, setNow] = useState(() => new Date());
  const requestId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const load = useCallback(async () => {
    if (!userId) return;
    const request = ++requestId.current;
    setRefreshing(true);
    setError(false);
    try {
      const [{ fullName: name, student: s }, bookings, lesson, homework, teacher] = await Promise.all([
        getMyStudentProfile(userId, true), listUpcomingBookings(userId, true), getLatestLesson(userId),
        listStudentHomework(userId), getStudentPrimaryTeacher(userId),
      ]);
      if (request !== requestId.current) return;
      setFullName(name);
      setStudent(s);
      setUpcoming(bookings);
      setLatestLesson(lesson);
      setRecentHomework(homework.filter((h) => h.status !== "graded").sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 2));
      setPrimaryTeacher(teacher);
      setReady(true);
    } catch {
      if (request === requestId.current) setError(true);
    } finally {
      if (request === requestId.current) setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    void load();
    return () => { requestId.current += 1; };
  }, [load]));

  function handleCancel(id: string) {
    Alert.alert("إلغاء الحصة", "سيُزال الموعد من حجوزاتك. هل تريد المتابعة؟", [
      { text: "الاحتفاظ بالحصة", style: "cancel" },
      { text: "إلغاء الحجز", style: "destructive", onPress: async () => {
        setCancellingId(id);
        try {
          const ok = await cancelBooking(id);
          if (!ok) throw new Error("cancel_failed");
          setUpcoming((prev) => prev.filter((b) => b.id !== id));
        } catch {
          Alert.alert("لم يُلغَ الحجز", "تحقق من اتصالك بالإنترنت ثم حاول مجددًا.");
        } finally { setCancellingId(null); }
      } },
    ]);
  }

  const plan = useMemo<HomePlan | null>(() => {
    if (!student?.plan_duration_months) return null;
    const result = buildPlan({
      durationMonths: student.plan_duration_months, alreadyMemorizedJuz: student.already_memorized_juz,
      reviewDaysPerWeek: student.review_days_per_week === 2 ? 2 : 1,
      direction: student.plan_direction === "fromStart" ? "fromStart" : "fromEnd",
    });
    const start = new Date(student.plan_started_at ?? student.created_at);
    if (Number.isNaN(start.getTime())) return null;
    const week = weekIndexForDate(result, start, now);
    const portion = week ? getWeekPlan(result, week) : undefined;
    const position = (p: { surahNumber: number; ayahInSurah: number }) => `${getSurahByNumber(p.surahNumber)?.nameAr ?? ""} · الآية ${p.ayahInSurah}`;
    return {
      week, totalWeeks: result.totalWeeks, percent: overallProgressPercent(result, week),
      from: portion ? position(portion.fromPosition) : undefined, to: portion ? position(portion.toPosition) : undefined,
    };
  }, [student, now]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing && ready} onRefresh={load} tintColor={colors.primary} colors={[colors.primary]} />}>
        <HomeDashboard name={fullName || "طالب متقن"} program={student?.program_slug ? getProgramBySlug(student.program_slug)?.title : undefined}
          dateLabel={now.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}
          ready={ready} error={error} retry={load} bookings={upcoming} formatDate={formatDate} plan={plan}
          teacher={primaryTeacher ? { ...primaryTeacher, online: onlineTeacherIds.has(primaryTeacher.id) && isWithinAvailableWindow(primaryTeacher.availableTimes, now) } : null}
          liveBookingIds={new Set([...liveRooms.entries()].filter(([, room]) => room.teacherPresent).map(([id]) => id))}
          homework={recentHomework} latestLesson={latestLesson} cancellingId={cancellingId} onCancel={handleCancel} navigate={(href) => router.push(href)} />
        {ready ? <PaidLessonsNotice upcoming={upcoming} studentName={fullName} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: 20, paddingTop: 14, paddingBottom: 32, gap: 20 },
});
