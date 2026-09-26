import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../lib/auth";
import { listUpcomingBookings, UpcomingBooking } from "../lib/studentProfile";
import { LessonWithTeacher, listStudentLessons } from "../lib/lessons";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

export default function LessonsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const userId = session?.user?.id;

  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [past, setPast] = useState<LessonWithTeacher[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [u, p] = await Promise.all([listUpcomingBookings(userId), listStudentLessons(userId)]);
      if (cancelled) return;
      setUpcoming(u);
      setPast(p);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

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
          {past.length === 0 ? (
            <Text style={styles.empty}>لا يوجد سجل حصص سابقة</Text>
          ) : (
            past.map((l) => (
              <View key={l.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconBubble}>
                    <Ionicons name="time-outline" size={18} color={colors.goldDark} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.title}>{l.attended ? `${l.surah ?? ""} — ${l.ayah_range ?? ""}` : "لم يحضر الطالب"}</Text>
                    <Text style={styles.meta}>
                      {l.session_date} · مع {l.teacherName}
                    </Text>
                    {l.notes && <Text style={styles.notes}>{l.notes}</Text>}
                  </View>
                  <View style={[styles.statusBadge, l.attended ? styles.statusOk : styles.statusAbsent]}>
                    <Text style={[styles.statusText, l.attended ? styles.statusOkText : styles.statusAbsentText]}>
                      {l.attended ? "حضر" : "غياب"}
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
  iconBubble: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
  notes: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
  joinButton: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingVertical: 10, alignItems: "center" },
  joinButtonText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 13 },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusOk: { backgroundColor: "#D1FAE5" },
  statusAbsent: { backgroundColor: "#FEE2E2" },
  statusText: { fontFamily: fonts.bold, fontSize: 11 },
  statusOkText: { color: "#059669" },
  statusAbsentText: { color: colors.danger },
  });
}
