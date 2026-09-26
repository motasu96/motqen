import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { getActiveTeachers, Teacher } from "../../lib/teachers";
import { colors, fonts, radius, shadow } from "../../lib/theme";

function Stars({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name={i < Math.round(value) ? "star" : "star-outline"} size={14} color={colors.gold} />
      ))}
    </View>
  );
}

export default function TeachersScreen() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await getActiveTeachers();
      if (cancelled) return;
      setTeachers(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "المعلمون" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          style={styles.screen}
          contentContainerStyle={styles.content}
          data={teachers}
          keyExtractor={(t) => t.slug}
          ListEmptyComponent={<Text style={styles.empty}>لا يوجد معلمون متاحون حاليًا</Text>}
          renderItem={({ item: t }) => (
            <Link href={`/teachers/${t.slug}`} asChild>
              <TouchableOpacity style={styles.card} activeOpacity={0.75}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{t.name.trim().charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.title}>{t.title}</Text>
                <Stars value={t.stats.rating} />
                <Text style={styles.stats}>
                  +{t.stats.students} طالب · +{t.stats.yearsExperience} سنوات خبرة
                </Text>
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    gap: 6,
    ...shadow.soft,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontFamily: fonts.extraBold, fontSize: 24, color: colors.goldDark },
  name: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.ink, textAlign: "center" },
  title: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  stats: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "center", marginTop: 4 },
});
