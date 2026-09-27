import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useAuth } from "../../lib/auth";
import { programs } from "../../lib/programs";
import { getMyStudentProfile } from "../../lib/studentProfile";
import { fonts, Palette, radius, shadow, useTheme } from "../../lib/theme";

const PROGRAM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "hifz-mutqan": "book",
  "tilawa-tajweed": "mic",
  "muraja-hifz": "repeat",
  "qiraat-ashr": "ribbon",
  "bara-em-mutqin": "happy",
  "barnamej-nisaa": "flower",
};

export default function ProgramsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { student } = await getMyStudentProfile(userId);
      if (!cancelled) setCurrentSlug(student?.program_slug ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sorted = currentSlug
    ? [...programs].sort((a, b) => (a.slug === currentSlug ? -1 : b.slug === currentSlug ? 1 : 0))
    : programs;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {!currentSlug ? null : (
        <View style={styles.sectionHint}>
          <Ionicons name="information-circle-outline" size={15} color={colors.inkSoft} />
          <Text style={styles.sectionHintText}>برنامجك الحالي في الأعلى — ويمكنك تصفح بقية البرامج والالتحاق بها أيضًا</Text>
        </View>
      )}
      <FlatList
        contentContainerStyle={styles.content}
        data={sorted}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => {
          const isCurrent = item.slug === currentSlug;
          return (
            <Link href={`/programs/${item.slug}`} asChild>
              <TouchableOpacity style={[styles.card, isCurrent && styles.cardCurrent]} activeOpacity={0.75}>
                <View style={styles.headerRow}>
                  <View style={styles.iconBubble}>
                    <Ionicons name={PROGRAM_ICONS[item.slug] ?? "book-outline"} size={20} color={colors.goldDark} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.short}>{item.short}</Text>
                  </View>
                </View>
                <View style={styles.badgeRow}>
                  {isCurrent && (
                    <View style={[styles.badge, styles.currentBadge]}>
                      <Text style={[styles.badgeText, styles.currentBadgeText]}>برنامجك الحالي</Text>
                    </View>
                  )}
                  {item.courses && item.courses.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.courses.length} دورات داخل البرنامج</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </SafeAreaView>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  sectionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sectionHintText: { flex: 1, fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right" },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  cardCurrent: { borderColor: colors.gold, borderWidth: 1.5 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerText: { flex: 1 },
  iconBubble: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, textAlign: "right" },
  short: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, justifyContent: "flex-start" },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currentBadge: { backgroundColor: colors.gold },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldDark },
  currentBadgeText: { color: "#fff" },
  });
}
