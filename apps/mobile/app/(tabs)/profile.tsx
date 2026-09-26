import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { getMyStudentProfile } from "../../lib/studentProfile";
import { getProgramBySlug } from "../../lib/programs";
import { colors } from "../../lib/theme";

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

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.card}>
        <Text style={styles.name}>{fullName || "طالب متقن"}</Text>
        <Text style={styles.email}>{session?.user?.email}</Text>
        {program && <Text style={styles.program}>{program.title}</Text>}
      </View>
      <TouchableOpacity style={styles.logout} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line, gap: 4 },
  name: { fontSize: 17, fontWeight: "800", color: colors.ink, textAlign: "center" },
  email: { fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  program: { fontSize: 12, fontWeight: "700", color: colors.goldDark, textAlign: "center", marginTop: 4 },
  logout: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "800", fontSize: 14 },
});
