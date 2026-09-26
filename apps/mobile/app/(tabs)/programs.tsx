import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { programs } from "../../lib/programs";
import { colors } from "../../lib/theme";

export default function ProgramsScreen() {
  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={programs}
      keyExtractor={(p) => p.slug}
      renderItem={({ item }) => (
        <Link href={`/programs/${item.slug}`} asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.short}>{item.short}</Text>
            {item.courses && item.courses.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.courses.length} دورات داخل البرنامج</Text>
              </View>
            )}
          </TouchableOpacity>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 16, fontWeight: "800", color: colors.ink, textAlign: "right" },
  short: { fontSize: 13, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
  badge: {
    alignSelf: "flex-end",
    backgroundColor: colors.goldLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: colors.goldDark },
});
