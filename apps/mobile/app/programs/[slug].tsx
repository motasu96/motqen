import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { getProgramBySlug } from "../../lib/programs";
import { colors } from "../../lib/theme";

export default function ProgramDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
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
        <Text style={styles.title}>{program.title}</Text>
        <Text style={styles.short}>{program.short}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عن البرنامج</Text>
          <Text style={styles.body}>{program.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مميزات البرنامج</Text>
          {program.features.map((f) => (
            <Text key={f} style={styles.featureItem}>
              {"• "}
              {f}
            </Text>
          ))}
        </View>

        {program.courses && program.courses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الدورات المتاحة داخل البرنامج</Text>
            {program.courses.map((course, i) => (
              <View key={course.slug} style={styles.courseCard}>
                <Text style={styles.courseTitle}>
                  {i + 1}. {course.title}
                </Text>
                <Text style={styles.courseDesc}>{course.description}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.cta} onPress={() => router.push("/(tabs)/groups")}>
          <Text style={styles.ctaText}>عرض الحلقات المتاحة لهذا البرنامج</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 6 },
  notFound: { textAlign: "center", marginTop: 40, color: colors.inkSoft },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink, textAlign: "right" },
  short: { fontSize: 14, color: colors.inkSoft, textAlign: "right", marginBottom: 10 },
  section: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.ink, textAlign: "right", marginBottom: 8 },
  body: { fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 20 },
  featureItem: { fontSize: 13, color: colors.inkSoft, textAlign: "right", marginBottom: 4 },
  courseCard: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 10 },
  courseTitle: { fontSize: 13, fontWeight: "800", color: colors.ink, textAlign: "right" },
  courseDesc: { fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 3, lineHeight: 18 },
  cta: { backgroundColor: colors.gold, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
