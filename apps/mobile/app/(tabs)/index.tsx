import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useAuth } from "../../lib/auth";
import { getMyStudentProfile, listUpcomingBookings, UpcomingBooking } from "../../lib/studentProfile";
import { getProgramBySlug } from "../../lib/programs";
import { colors } from "../../lib/theme";

const DAY_LABELS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${DAY_LABELS[d.getDay()]} ${d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}`;
}

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [fullName, setFullName] = useState<string | null>(null);
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [{ fullName: name, student }, bookings] = await Promise.all([
        getMyStudentProfile(userId),
        listUpcomingBookings(userId),
      ]);
      if (cancelled) return;
      setFullName(name);
      setProgramSlug(student?.program_slug ?? null);
      setUpcoming(bookings);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const program = programSlug ? getProgramBySlug(programSlug) : undefined;
  const nextSession = upcoming[0];

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>أهلًا بك، {fullName || "طالب متقن"}</Text>

        {!ready ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 12 }} />
        ) : (
          <>
            {program && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>المسار المسجّل به</Text>
                <Text style={styles.cardTitle}>{program.title}</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardLabel}>حصتك القادمة</Text>
              {nextSession ? (
                <>
                  <Text style={styles.cardTitle}>
                    {formatDate(nextSession.date)} · {nextSession.time}
                  </Text>
                  <Text style={styles.cardDesc}>مع {nextSession.teacherName}</Text>
                </>
              ) : (
                <Text style={styles.cardDesc}>لا توجد حصص فردية محجوزة قريبًا</Text>
              )}
            </View>
          </>
        )}

        <Link href="/(tabs)/groups" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>حلقاتك الجماعية</Text>
            <Text style={styles.cardDesc}>تابع حلقاتك وانضم إلى حصتك عند الموعد</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/programs" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>استكشف البرامج</Text>
            <Text style={styles.cardDesc}>الحفظ، التلاوة والتجويد، المراجعة، والإجازة بالسند</Text>
          </TouchableOpacity>
        </Link>

        <Text style={styles.sectionTitle}>قوائمي</Text>
        <View style={styles.menuGrid}>
          <Link href="/reports" asChild>
            <TouchableOpacity style={styles.menuCard}>
              <Text style={styles.menuLabel}>التقارير</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/homework" asChild>
            <TouchableOpacity style={styles.menuCard}>
              <Text style={styles.menuLabel}>الواجبات</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/exams" asChild>
            <TouchableOpacity style={styles.menuCard}>
              <Text style={styles.menuLabel}>الاختبارات والشهادات</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/notices" asChild>
            <TouchableOpacity style={styles.menuCard}>
              <Text style={styles.menuLabel}>الإشعارات</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  greeting: { fontSize: 20, fontWeight: "800", color: colors.ink, textAlign: "right" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardLabel: { fontSize: 11, fontWeight: "700", color: colors.goldDark, textAlign: "right", marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.ink, textAlign: "right" },
  cardDesc: { fontSize: 13, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.ink, textAlign: "right", marginTop: 6 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  menuCard: {
    flexBasis: "47%",
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  menuLabel: { fontSize: 13, fontWeight: "700", color: colors.ink, textAlign: "center" },
});
