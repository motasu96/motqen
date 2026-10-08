import { useEffect, useState } from "react";
import { Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { fonts, Palette, radius, shadow, useTheme } from "../../lib/theme";

// Account block shared by the "More" screens of the teacher and admin
// interfaces: who is signed in, dark mode, support link, sign-out.
export default function AccountPanel({ roleLabel }: { roleLabel: string }) {
  const { session } = useAuth();
  const { colors, isDark, toggle } = useTheme();
  const styles = getStyles(colors);
  const userId = session?.user?.id;
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
      if (!cancelled) setFullName((data?.full_name as string | null) ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const displayName = fullName || roleLabel;

  return (
    <View style={{ gap: 14 }}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.trim().charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{session?.user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.bubble}>
            <Ionicons name={isDark ? "moon" : "sunny-outline"} size={18} color={colors.goldDark} />
          </View>
          <Text style={styles.settingLabel}>الوضع الليلي</Text>
          <Switch value={isDark} onValueChange={toggle} trackColor={{ false: colors.line, true: colors.gold }} thumbColor="#fff" />
        </View>
        <TouchableOpacity
          style={styles.settingRow}
          activeOpacity={0.7}
          onPress={() => Linking.openURL("https://www.motqen.site/contact")}
        >
          <View style={styles.bubble}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.goldDark} />
          </View>
          <Text style={styles.settingLabel}>تواصل معنا</Text>
          <Ionicons name="chevron-back" size={16} color={colors.inkSoft} />
        </TouchableOpacity>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.bubble}>
            <Ionicons name="information-circle-outline" size={18} color={colors.goldDark} />
          </View>
          <Text style={styles.settingLabel}>عن التطبيق</Text>
          <Text style={styles.version}>الإصدار {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logout} onPress={() => supabase.auth.signOut()} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.line,
      alignItems: "center",
      gap: 4,
      ...shadow.soft,
    },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    avatarText: { fontFamily: fonts.extraBold, fontSize: 24, color: colors.goldDark },
    name: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.ink, textAlign: "center" },
    email: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center" },
    roleBadge: { backgroundColor: colors.goldLight, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8 },
    roleText: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark },
    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.line,
      paddingHorizontal: 18,
      ...shadow.soft,
    },
    settingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.line },
    bubble: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
    settingLabel: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
    version: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
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
}
