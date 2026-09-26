import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { getProgramBySlug } from "../../lib/programs";
import { fonts, gradientFor, Palette, radius, shadow, useTheme } from "../../lib/theme";

export default function ProgramDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const program = getProgramBySlug(slug);

  if (!program) {
    return (
      <View style={styles.screen}>
        <Text style={styles.notFound}>لم يتم العثور على البرنامج</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: program.title }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>{program.title}</Text>
          <Text style={styles.short}>{program.short}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.goldDark} />
            <Text style={styles.sectionTitle}>عن البرنامج</Text>
          </View>
          <Text style={styles.body}>{program.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={18} color={colors.goldDark} />
            <Text style={styles.sectionTitle}>مميزات البرنامج</Text>
          </View>
          {program.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
              <Text style={styles.featureItem}>{f}</Text>
            </View>
          ))}
        </View>

        {program.courses && program.courses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={18} color={colors.goldDark} />
              <Text style={styles.sectionTitle}>الدورات المتاحة داخل البرنامج</Text>
            </View>
            {program.courses.map((course, i) => (
              <View key={course.slug} style={styles.courseCard}>
                <View style={styles.courseHeaderRow}>
                  <View style={styles.courseNumber}>
                    <Text style={styles.courseNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                </View>
                <Text style={styles.courseDesc}>{course.description}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity onPress={() => router.push("/(tabs)/groups")} activeOpacity={0.85}>
          <LinearGradient colors={gradientFor(colors)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Text style={styles.ctaText}>عرض الحلقات المتاحة لهذا البرنامج</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 6, paddingBottom: 32 },
  notFound: { textAlign: "center", marginTop: 40, color: colors.inkSoft, fontFamily: fonts.regular },
  heroCard: { marginBottom: 4 },
  title: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.ink, textAlign: "right" },
  short: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 10,
    ...shadow.soft,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, justifyContent: "flex-start" },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" },
  body: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6, justifyContent: "flex-start" },
  featureItem: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right" },
  courseCard: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, marginTop: 12 },
  courseHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-start" },
  courseNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
  courseNumberText: { fontFamily: fonts.extraBold, fontSize: 12, color: colors.goldDark },
  courseTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
  courseDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 6, lineHeight: 18 },
  cta: { borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: 18 },
  ctaText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 14 },
  });
}
