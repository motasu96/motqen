import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Constants from "expo-constants";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { SITE_URL } from "../../lib/site";
import { getMyStudentProfile } from "../../lib/studentProfile";
import { getProgramBySlug } from "../../lib/programs";
import { fonts, Palette, radius, shadow, useTheme } from "../../lib/theme";

export default function ProfileScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const { colors, isDark, toggle } = useTheme();
  const styles = getStyles(colors);
  const userId = session?.user?.id;
  const [fullName, setFullName] = useState<string | null>(null);
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
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
    }, [userId])
  );

  async function saveName() {
    if (saving || !userId) return;
    const name = nameDraft.trim();
    if (!name) { setSaveError("أدخل اسمًا صحيحًا"); return; }
    setSaving(true); setSaveError(null);
    try {
      const { data, error } = await supabase.from("profiles").update({ full_name: name }).eq("id", userId).select("full_name").single();
      if (error || !data) throw new Error("profile_update_failed");
      setFullName(data.full_name); setEditing(false);
    } catch { setSaveError("تعذّر حفظ الاسم. تحقق من الاتصال وحاول مرة أخرى."); }
    finally { setSaving(false); }
  }

  function confirmLogout() {
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج من متقن؟", [
      { text: "تراجع", style: "cancel" },
      { text: "تسجيل الخروج", onPress: async () => {
        try { const { error } = await supabase.auth.signOut(); if (error) throw error; }
        catch { Alert.alert("تعذّر تسجيل الخروج", "حاول مرة أخرى."); }
      } },
    ]);
  }

  function confirmDelete() {
    Alert.alert(
      "حذف الحساب",
      "سيتم حذف حسابك وجميع بياناتك (الحجوزات والحصص والواجبات والشهادات) نهائيًا ولا يمكن التراجع عن ذلك. هل أنت متأكد؟",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "حذف نهائيًا", style: "destructive", onPress: deleteAccount },
      ]
    );
  }

  async function deleteAccount() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      Alert.alert("تعذّر الحذف", "سجّل الدخول من جديد ثم حاول مرة أخرى.");
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`${SITE_URL}/api/delete-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(String(response.status));
      await supabase.auth.signOut();
    } catch {
      Alert.alert("تعذّر حذف الحساب", "تحقق من اتصالك بالإنترنت وحاول مرة أخرى، أو تواصل معنا ليتم الحذف.");
    } finally {
      setDeleting(false);
    }
  }

  const program = programSlug ? getProgramBySlug(programSlug) : undefined;
  const displayName = fullName || "طالب متقن";

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text accessibilityRole="header" style={styles.heading}>حسابي</Text>
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
        <TouchableOpacity accessibilityRole="button" onPress={() => { setNameDraft(fullName ?? ""); setSaveError(null); setEditing(true); }} style={styles.editButton}>
          <Ionicons name="create-outline" size={18} color={colors.goldDark} /><Text style={styles.editText}>تعديل البيانات</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingIconBubble}>
            <Ionicons name={isDark ? "moon" : "sunny-outline"} size={18} color={colors.goldDark} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>الوضع الليلي</Text>
            <Text style={styles.settingDesc}>{isDark ? "مفعّل" : "غير مفعّل"}</Text>
          </View>
          <Switch
            accessibilityLabel="الوضع الليلي"
            value={isDark}
            onValueChange={toggle}
            trackColor={{ false: colors.line, true: colors.gold }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          style={styles.settingRow}
          activeOpacity={0.7}
          onPress={() => Linking.openURL("https://www.motqen.site/contact")}
        >
          <View style={styles.settingIconBubble}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.goldDark} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>تواصل معنا</Text>
            <Text style={styles.settingDesc}>الدعم والاستفسارات</Text>
          </View>
          <Ionicons name="chevron-back" size={16} color={colors.inkSoft} />
        </TouchableOpacity>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingIconBubble}>
            <Ionicons name="information-circle-outline" size={18} color={colors.goldDark} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>عن التطبيق</Text>
          </View>
          <Text style={styles.versionText}>الإصدار {Constants.expoConfig?.version ?? "1.0.0"}</Text>
        </View>
      </View>

      <View style={styles.settingsCard}>
        <TouchableOpacity accessibilityRole="link" style={styles.settingRow} onPress={() => router.push("/study")}><Ionicons name="book-outline" size={20} color={colors.goldDark} /><Text style={[styles.settingLabel, { flex: 1 }]}>دراستي</Text><Ionicons name="chevron-back" size={16} color={colors.inkSoft} /></TouchableOpacity>
        <TouchableOpacity accessibilityRole="link" style={styles.settingRow} onPress={() => Linking.openURL(SITE_URL + "/privacy")}><Text style={styles.settingLabel}>سياسة الخصوصية</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="link" style={[styles.settingRow, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL(SITE_URL + "/terms")}><Text style={styles.settingLabel}>الشروط والأحكام</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logout} onPress={confirmLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteLink} onPress={confirmDelete} disabled={deleting} activeOpacity={0.7}>
        {deleting ? (
          <ActivityIndicator color={colors.danger} size="small" />
        ) : (
          <Text style={styles.deleteText}>حذف حسابي</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => { if (!saving) setEditing(false); }}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View accessibilityViewIsModal style={styles.editor}>
            <Text accessibilityRole="header" style={styles.heading}>تعديل البيانات</Text>
            <Text style={styles.settingLabel}>الاسم الكامل</Text>
            <TextInput accessibilityLabel="الاسم الكامل" autoFocus editable={!saving} value={nameDraft} onChangeText={setNameDraft} maxLength={80} placeholder="اسمك الكامل" placeholderTextColor={colors.inkSoft} style={styles.nameInput} textAlign="right" returnKeyType="done" onSubmitEditing={saveName} />
            {saveError ? <Text accessibilityRole="alert" style={styles.saveError}>{saveError}</Text> : null}
            <TouchableOpacity accessibilityRole="button" onPress={saveName} disabled={saving} style={styles.saveButton}>{saving ? <ActivityIndicator color="#2E2418" /> : <Text style={styles.saveText}>حفظ</Text>}</TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={() => setEditing(false)} style={styles.cancelEdit}><Text style={styles.editText}>إلغاء</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, gap: 16, paddingBottom: 32 },
    heading: { fontFamily: fonts.extraBold, fontSize: 25, color: colors.ink, textAlign: "center" },
    editButton: { flexDirection: "row", minHeight: 48, alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 22, borderRadius: radius.pill, marginTop: 14 },
    editText: { fontFamily: fonts.bold, fontSize: 14, color: colors.goldDark },
    overlay: { flex: 1, backgroundColor: "rgba(46,36,24,0.45)", justifyContent: "center", padding: 24 },
    editor: { backgroundColor: colors.card, padding: 22, borderRadius: radius.xl, gap: 16 },
    nameInput: { minHeight: 52, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 16, color: colors.ink, backgroundColor: colors.card },
    saveError: { fontFamily: fonts.medium, color: colors.danger, fontSize: 13, textAlign: "right", lineHeight: 22 },
    saveButton: { minHeight: 52, backgroundColor: colors.gold, justifyContent: "center", alignItems: "center", borderRadius: radius.md },
    saveText: { fontFamily: fonts.bold, color: "#2E2418", fontSize: 15 },
    cancelEdit: { minHeight: 48, alignItems: "center", justifyContent: "center" },
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
    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.line,
      paddingHorizontal: 18,
      ...shadow.soft,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 58,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    settingIconBubble: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
    settingText: { flex: 1 },
    settingLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
    settingDesc: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
    versionText: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
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
    deleteLink: { alignItems: "center", paddingVertical: 10 },
    deleteText: { color: colors.inkSoft, fontFamily: fonts.medium, fontSize: 12, textDecorationLine: "underline" },
  });
}
