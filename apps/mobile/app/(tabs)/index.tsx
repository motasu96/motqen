import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useAuth } from "../../lib/auth";
import { getMyStudentProfile, listUpcomingBookings, UpcomingBooking } from "../../lib/studentProfile";
import { getProgramBySlug } from "../../lib/programs";
import { colors, fonts, gradients, radius, shadow } from "../../lib/theme";

const DAY_LABELS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${DAY_LABELS[d.getDay()]} ${d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}`;
}

const MENU_ITEMS = [
  { href: "/reports", label: "التقارير", icon: "bar-chart-outline" as const },
  { href: "/homework", label: "الواجبات", icon: "document-text-outline" as const },
  { href: "/exams", label: "الاختبارات والشهادات", icon: "ribbon-outline" as const },
  { href: "/notices", label: "الإشعارات", icon: "notifications-outline" as const },
];

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
  const displayName = fullName || "طالب متقن";
  const initial = displayName.trim().charAt(0);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
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
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.goldDark} />
              <Text style={styles.cardLabel}>حصتك القادمة</Text>
            </View>
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

const styles = StyleSheet.create({
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
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6, justifyContent: "flex-start" },
  cardLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark, textAlign: "right" },
  cardTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, textAlign: "right" },
  cardDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
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
