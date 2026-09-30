import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../lib/auth";
import { listUpcomingBookings, UpcomingBooking } from "../lib/studentProfile";
import { listStudentLessons } from "../lib/lessons";
import { listStudentGroupAttendance } from "../lib/groups";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

type HistoryItem = {
  id: string;
  date: string;
  attended: boolean;
  contextLabel: string;
  from: string | null;
  to: string | null;
  grade: string | null;
  notes: string | null;
};

export default function LessonsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const userId = session?.user?.id;

  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const [u, lessons, groupAttendance] = await Promise.all([
      listUpcomingBookings(userId),
      listStudentLessons(userId),
      listStudentGroupAttendance(userId),
    ]);
    setUpcoming(u);

    const lessonItems: HistoryItem[] = lessons.map((l) => ({
      id: `lesson-${l.id}`,
      date: l.session_date,
      attended: l.attended,
      contextLabel: l.teacherName,
      from: l.surah,
      to: l.ayah_range,
      grade: null,
      notes: l.notes,
    }));
    const groupItems: HistoryItem[] = groupAttendance.map((g) => ({
      id: `group-${g.id}`,
      date: g.sessionDate,
      attended: g.attended,
      contextLabel: `${g.groupTitle} · ${g.teacherName}`,
      from: g.recitationFrom,
      to: g.recitationTo,
      grade: g.grade,
      notes: g.notes,
    }));

    setHistory([...lessonItems, ...groupItems].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)));
    setReady(true);
  }, [userId]);

  // Refetches every time this screen comes into focus (not just on first
  // mount), so a session the teacher just logged shows up without having
  // to force-close and reopen the app.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "الحصص" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>الحصص القادمة</Text>
          {upcoming.length === 0 ? (
            <Text style={styles.empty}>لا توجد حصص قادمة محجوزة</Text>
          ) : (
            upcoming.map((b) => (
              <View key={b.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconBubble}>
                    <Ionicons name="time-outline" size={18} color={colors.goldDark} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.title}>{b.date}</Text>
                    <Text style={styles.meta}>
                      الساعة {b.time} · مع {b.teacherName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton} onPress={() => router.push(`/room/${b.id}`)}>
                  <Text style={styles.joinButtonText}>دخول الحصة</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>سجل الحصص السابقة</Text>
          {history.length === 0 ? (
            <Text style={styles.empty}>لا يوجد سجل حصص سابقة</Text>
          ) : (
            history.map((h) => (
              <View key={h.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconBubble}>
                    <Ionicons name="time-outline" size={18} color={colors.goldDark} />
                  </View>
                  <View style={styles.rowText}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>
                        {h.attended ? [h.from, h.to].filter(Boolean).join(" — ") || "—" : "لم يحضر الطالب"}
                      </Text>
                      {h.grade && (
                        <View style={styles.gradeBadge}>
                          <Text style={styles.gradeBadgeText}>{h.grade}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.meta}>
                      {h.date} · مع {h.contextLabel}
                    </Text>
                    {h.notes && <Text style={styles.notes}>{h.notes}</Text>}
                  </View>
                  <View style={[styles.statusBadge, h.attended ? styles.statusOk : styles.statusAbsent]}>
                    <Text style={[styles.statusText, h.attended ? styles.statusOkText : styles.statusAbsentText]}>
                      {h.attended ? "حضر" : "غياب"}
                    </Text>
                  </View>
                </View>
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
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right" },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.line, gap: 10, ...shadow.soft },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowText: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  iconBubble: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
  notes: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
  joinButton: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingVertical: 10, alignItems: "center" },
  joinButtonText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 13 },
  gradeBadge: { backgroundColor: colors.goldLight, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  gradeBadgeText: { fontFamily: fonts.bold, fontSize: 10, color: colors.goldDark },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusOk: { backgroundColor: "#D1FAE5" },
  statusAbsent: { backgroundColor: "#FEE2E2" },
  statusText: { fontFamily: fonts.bold, fontSize: 11 },
  statusOkText: { color: "#059669" },
  statusAbsentText: { color: colors.danger },
  });
}
