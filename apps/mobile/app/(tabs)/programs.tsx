import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { programs } from "../../lib/programs";
import { colors, fonts, radius, shadow } from "../../lib/theme";

const PROGRAM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "hifz-mutqan": "book",
  "tilawa-tajweed": "mic",
  "muraja-hifz": "repeat",
  "qiraat-ashr": "ribbon",
  "bara-em-mutqin": "happy",
  "barnamej-nisaa": "flower",
};

export default function ProgramsScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={programs}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => (
          <Link href={`/programs/${item.slug}`} asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.75}>
              <View style={styles.headerRow}>
                <View style={styles.iconBubble}>
                  <Ionicons name={PROGRAM_ICONS[item.slug] ?? "book-outline"} size={20} color={colors.goldDark} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.short}>{item.short}</Text>
                </View>
              </View>
              {item.courses && item.courses.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.courses.length} دورات داخل البرنامج</Text>
                </View>
              )}
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerText: { flex: 1 },
  iconBubble: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, textAlign: "right" },
  short: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldDark },
});
