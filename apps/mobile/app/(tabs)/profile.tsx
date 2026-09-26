import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";

export default function ProfileScreen() {
  const { session } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.email}>{session?.user?.email}</Text>
      </View>
      <TouchableOpacity style={styles.logout} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line },
  email: { fontSize: 15, fontWeight: "700", color: colors.ink, textAlign: "center" },
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
