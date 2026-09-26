import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../lib/auth";
import { colors } from "../../lib/theme";

export default function HomeScreen() {
  const { session } = useAuth();
  const email = session?.user?.email ?? "";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>أهلًا بك في متقن</Text>
      <Text style={styles.email}>{email}</Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  greeting: { fontSize: 22, fontWeight: "800", color: colors.ink, textAlign: "right" },
  email: { fontSize: 13, color: colors.inkSoft, textAlign: "right", marginBottom: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.ink, textAlign: "right" },
  cardDesc: { fontSize: 13, color: colors.inkSoft, textAlign: "right", marginTop: 4 },
});
