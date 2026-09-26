import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { getMyStudentProfile } from "../../lib/studentProfile";
import { getProgramBySlug } from "../../lib/programs";
import { colors, fonts, radius, shadow } from "../../lib/theme";

export default function ProfileScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [fullName, setFullName] = useState<string | null>(null);
  const [programSlug, setProgramSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { fullName: name, student } = await getMyStudentProfile(userId);
      if (cancelled) return;
      setFullName(name);
      setProgramSlug(student?.program_slug ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const program = programSlug ? getProgramBySlug(programSlug) : undefined;
  const displayName = fullName || "طالب متقن";

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.trim().charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{session?.user?.email}</Text>
        {program && (
          <View style={styles.programBadge}>
            <Ionicons name="book-outline" size={13} color={colors.goldDark} />
            <Text style={styles.program}>{program.title}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logout} onPress={() => supabase.auth.signOut()} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 14 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    gap: 4,
    ...shadow.soft,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.goldDark },
  name: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.ink, textAlign: "center" },
  email: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  programBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.goldLight,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  program: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark, textAlign: "center" },
  logout: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontFamily: fonts.bold, fontSize: 14 },
});
