import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "../components/staff/ui";
import { homeRouteFor, useAuth } from "../lib/auth";
import { fonts, radius, useTheme } from "../lib/theme";

const ITEMS = [
  { href: "/(tabs)/programs", label: "البرامج", icon: "book-outline" },
  { href: "/teachers", label: "المعلمون", icon: "people-circle-outline" },
  { href: "/(tabs)/groups", label: "حلقاتي الجماعية", icon: "people-outline" },
  { href: "/lessons", label: "حصصي", icon: "calendar-outline" },
  { href: "/homework", label: "الواجبات", icon: "document-text-outline" },
  { href: "/reports", label: "التقارير", icon: "bar-chart-outline" },
  { href: "/exams", label: "الاختبارات", icon: "clipboard-outline" },
  { href: "/certificates", label: "الشهادات", icon: "ribbon-outline" },
  { href: "/archive", label: "أرشيف الحفظ", icon: "folder-outline" },
  { href: "/notices", label: "الإعلانات", icon: "notifications-outline" },
] as const;

export default function StudyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { session, role, loading } = useAuth();
  if (!loading && !session) return <Redirect href="/login" />;
  if (role === "teacher" || role === "admin") return <Redirect href={homeRouteFor(role)} />;
  return (
    <Screen title="دراستي" subtitle="كل أدوات رحلتك مع القرآن" right={
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="العودة إلى الرئيسية" onPress={() => router.replace("/(tabs)")} style={[styles.back, { borderColor: colors.line, backgroundColor: colors.card }]}>
        <Ionicons name="arrow-forward" size={22} color={colors.goldDark} />
      </TouchableOpacity>
    }>
      <View style={styles.grid}>
        {ITEMS.map(item => (
          <TouchableOpacity accessibilityRole="link" key={item.href} onPress={() => router.push(item.href)} style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.line }]}>
            <View style={[styles.bubble, { backgroundColor: colors.goldLight }]}><Ionicons name={item.icon} size={24} color={colors.goldDark} /></View>
            <Text style={[styles.label, { color: colors.ink }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { flexBasis: "47%", flexGrow: 1, minHeight: 110, borderWidth: 1, borderRadius: radius.lg, padding: 16, justifyContent: "center", alignItems: "center", gap: 12 },
  label: { fontFamily: fonts.bold, fontSize: 14, textAlign: "center" },
  bubble: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  back: { minWidth: 48, minHeight: 48, borderWidth: 1, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
