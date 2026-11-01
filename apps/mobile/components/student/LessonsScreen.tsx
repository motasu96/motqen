import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Stack, useFocusEffect, useRouter } from "expo-router";
import { homeRouteFor, useAuth } from "../../lib/auth";
import { cancelBooking, listUpcomingBookings, UpcomingBooking } from "../../lib/studentProfile";
import { listStudentLessons } from "../../lib/lessons";
import { listStudentGroupAttendance } from "../../lib/groups";
import { useLiveRooms } from "../../lib/presence";
import PulseBadge from "../PulseBadge";
import { fonts, Palette, radius, shadow, useTheme } from "../../lib/theme";

type HistoryItem = { id: string; date: string; attended: boolean; contextLabel: string; from: string | null; to: string | null; grade: string | null; notes: string | null };
function formatDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" });
}
export default function LessonsScreen() {
  const { session, role, loading: authLoading } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const userId = session?.user?.id;
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const request = useRef(0);
  const liveRooms = useLiveRooms();

  const load = useCallback(async () => {
    if (!userId) return;
    const currentRequest = ++request.current;
    setError(null);
    try {
      const [u, lessons, groupAttendance] = await Promise.all([
        listUpcomingBookings(userId), listStudentLessons(userId), listStudentGroupAttendance(userId),
      ]);
      if (currentRequest !== request.current) return;
      setUpcoming(u);
      const lessonItems: HistoryItem[] = lessons.map(l => ({
        id: "lesson-" + l.id, date: l.session_date, attended: l.attended, contextLabel: l.teacherName,
        from: l.surah, to: l.ayah_range, grade: null, notes: l.notes,
      }));
      const groupItems: HistoryItem[] = groupAttendance.map(g => ({
        id: "group-" + g.id, date: g.sessionDate, attended: g.attended,
        contextLabel: g.groupTitle + " · " + g.teacherName, from: g.recitationFrom, to: g.recitationTo, grade: g.grade, notes: g.notes,
      }));
      setHistory([...lessonItems, ...groupItems].sort((a, b) => b.date.localeCompare(a.date)));
    } catch {
      if (currentRequest === request.current) setError("تعذّر تحميل الحصص. تحقق من الاتصال وحاول مرة أخرى.");
    } finally {
      if (currentRequest === request.current) { setReady(true); setRefreshing(false); }
    }
  }, [userId]);
  useFocusEffect(useCallback(() => {
    void load();
    return () => { request.current += 1; };
  }, [load]));

  function confirmCancel(booking: UpcomingBooking) {
    if (cancellingId) return;
    Alert.alert("إلغاء الحصة", "هل تريد إلغاء حصتك مع " + booking.teacherName + "؟", [
      { text: "تراجع", style: "cancel" },
      { text: "إلغاء الحصة", style: "destructive", onPress: async () => {
        setCancellingId(booking.id);
        try {
          if (!await cancelBooking(booking.id)) throw new Error("cancel_failed");
          setUpcoming(items => items.filter(item => item.id !== booking.id));
        } catch { Alert.alert("تعذّر إلغاء الحصة", "حاول مرة أخرى بعد التأكد من الاتصال."); }
        finally { setCancellingId(null); }
      } },
    ]);
  }

  if (!authLoading && !session) return <Redirect href="/login" />;
  if (role === "teacher" || role === "admin") return <Redirect href={homeRouteFor(role)} />;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.goldDark} />}>
        <View style={styles.header}>
          <View style={styles.grow}><Text accessibilityRole="header" style={styles.heading}>حصصي</Text><Text style={styles.subtitle}>مواعيدك مع القرآن</Text></View>
          <TouchableOpacity accessibilityRole="button" style={styles.book} onPress={() => router.push("/teachers")}>
            <Ionicons name="add" size={18} color={colors.goldDark} /><Text style={styles.bookText}>حجز حصة</Text>
          </TouchableOpacity>
        </View>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {([{ key: "upcoming", label: "القادمة" }, { key: "past", label: "السابقة" }] as const).map(item => (
            <TouchableOpacity key={item.key} accessibilityRole="tab" accessibilityState={{ selected: tab === item.key }} onPress={() => setTab(item.key)} style={[styles.tab, tab === item.key && styles.activeTab]}>
              <Text style={[styles.tabText, tab === item.key && { color: colors.ink }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!ready || authLoading ? <ActivityIndicator color={colors.goldDark} style={{ marginVertical: 32 }} /> : error ? (
          <View style={styles.card}><Text accessibilityRole="alert" style={styles.meta}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => { void load(); }} style={styles.join}><Text style={styles.joinText}>إعادة المحاولة</Text></TouchableOpacity></View>
        ) : tab === "upcoming" ? (
          upcoming.length ? upcoming.map(booking => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.row}><Text style={styles.title}>{formatDate(booking.date)}</Text>{liveRooms.get(booking.id)?.teacherPresent ? <PulseBadge color="emerald" label="مباشر الآن" /> : null}</View>
              <View style={styles.row}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{booking.teacherName.trim().charAt(0)}</Text></View>
                <View style={styles.grow}><Text style={styles.title}>مع {booking.teacherName}</Text><Text style={styles.meta}>{booking.time}</Text></View>
              </View>
              <TouchableOpacity accessibilityRole="button" style={styles.join} onPress={() => router.push("/room/" + booking.id)}><Ionicons name="videocam-outline" size={20} color="#2E2418" /><Text style={styles.joinText}>دخول الحصة</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={"إلغاء الحصة مع " + booking.teacherName} disabled={Boolean(cancellingId)} onPress={() => confirmCancel(booking)} style={styles.cancel}>
                {cancellingId === booking.id ? <ActivityIndicator color={colors.danger} /> : <Text style={styles.cancelText}>إلغاء الحصة</Text>}
              </TouchableOpacity>
            </View>
          )) : <View style={styles.card}><Text style={styles.title}>لا توجد حصص قادمة</Text><Text style={styles.meta}>اختر المعلم والموعد المناسب لبدء حصتك.</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push("/teachers")} style={styles.join}><Text style={styles.joinText}>حجز حصة</Text></TouchableOpacity></View>
        ) : history.length ? history.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}><Text style={[styles.status, { color: item.attended ? colors.success : colors.danger }]}>{item.attended ? "حضر" : "غياب"}</Text><Text style={styles.meta}>{formatDate(item.date)}</Text></View>
            <Text style={styles.title}>{item.attended ? [item.from, item.to].filter(Boolean).join(" — ") || "حصة سابقة" : "لم يحضر الطالب"}</Text>
            <Text style={styles.meta}>{item.contextLabel}</Text>
            {item.grade ? <Text style={styles.grade}>{item.grade}</Text> : null}
            {item.notes ? <Text style={styles.meta}>{item.notes}</Text> : null}
          </View>
        )) : <View style={styles.card}><Text style={styles.title}>لا يوجد سجل حصص سابقة</Text><Text style={styles.meta}>ستظهر الحصص هنا بعد تسجيلها من المعلم.</Text></View>}
        <TouchableOpacity accessibilityRole="link" onPress={() => router.push("/(tabs)/groups")} style={styles.groupLink}><Ionicons name="people-outline" color={colors.goldDark} size={20} /><Text style={styles.bookText}>حلقاتي الجماعية</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
function getStyles(colors: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg }, content: { padding: 20, paddingBottom: 32, gap: 16 },
    header: { flexDirection: "row", alignItems: "center", gap: 12 }, grow: { flex: 1 },
    heading: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.ink, textAlign: "right" },
    subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, textAlign: "right" },
    book: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 14, minHeight: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
    bookText: { fontFamily: fonts.bold, fontSize: 13, color: colors.goldDark, textAlign: "center" },
    tabs: { flexDirection: "row", borderRadius: radius.md, padding: 4, backgroundColor: colors.goldLight, gap: 4 },
    tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 48, padding: 10, borderRadius: radius.sm },
    activeTab: { backgroundColor: colors.card, ...shadow.soft }, tabText: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft },
    card: { backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1, borderRadius: radius.xl, padding: 20, gap: 12, ...shadow.soft },
    row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.goldLight },
    avatarText: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.goldDark },
    title: { fontFamily: fonts.bold, fontSize: 16, textAlign: "right", color: colors.ink },
    meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 23 },
    join: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, minHeight: 52, padding: 12, borderRadius: radius.md },
    joinText: { fontFamily: fonts.bold, color: "#2E2418", fontSize: 15 },
    cancel: { minHeight: 44, alignItems: "center", justifyContent: "center" }, cancelText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
    grade: { alignSelf: "flex-start", padding: 7, borderRadius: radius.sm, backgroundColor: colors.goldLight, color: colors.goldDark, fontFamily: fonts.bold },
    status: { fontFamily: fonts.bold, fontSize: 12 }, groupLink: { flexDirection: "row", minHeight: 48, gap: 8, alignItems: "center", justifyContent: "center" },
  });
}
