import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { getTeacherBySlug, Teacher } from "../../lib/teachers";
import { colors, fonts, radius, shadow } from "../../lib/theme";

function Stars({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name={i < Math.round(value) ? "star" : "star-outline"} size={18} color={colors.gold} />
      ))}
    </View>
  );
}

export default function TeacherDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const t = await getTeacherBySlug(slug);
      if (cancelled) return;
      setTeacher(t);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>لم يتم العثور على هذا المعلم</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: teacher.name }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{teacher.name.trim().charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{teacher.name}</Text>
          <Text style={styles.title}>{teacher.title}</Text>
          <Stars value={teacher.stats.rating} />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+{teacher.stats.students}</Text>
              <Text style={styles.statLabel}>الطلاب</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+{teacher.stats.yearsExperience}</Text>
              <Text style={styles.statLabel}>سنوات الخبرة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+{teacher.stats.completedSessions}</Text>
              <Text style={styles.statLabel}>الحصص المكتملة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{teacher.stats.rating}</Text>
              <Text style={styles.statLabel}>التقييم</Text>
            </View>
          </View>
        </View>

        {teacher.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نبذة</Text>
            <Text style={styles.bio}>{teacher.bio}</Text>
          </View>
        ) : null}

        {teacher.specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التخصصات</Text>
            <View style={styles.specialtiesRow}>
              {teacher.specialties.map((s) => (
                <View key={s} style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14, paddingBottom: 32 },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    gap: 6,
    ...shadow.soft,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontFamily: fonts.extraBold, fontSize: 30, color: colors.goldDark },
  name: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.ink, textAlign: "center" },
  title: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, width: "100%", justifyContent: "center" },
  statItem: { alignItems: "center", minWidth: 70 },
  statValue: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.goldDark },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, marginTop: 2 },
  section: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink, textAlign: "right", marginBottom: 8 },
  bio: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 20 },
  specialtiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specialtyBadge: { backgroundColor: colors.goldLight, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  specialtyText: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark },
});
