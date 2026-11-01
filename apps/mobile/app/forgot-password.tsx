import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BrandLogo from "../components/BrandLogo";
import { supabase } from "../lib/supabase";
import { SITE_URL } from "../lib/site";
import { fonts, Palette, radius, useTheme } from "../lib/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function sendResetLink() {
    if (submitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("أدخل بريدًا إلكترونيًا صحيحًا"); return; }
    setSubmitting(true); setError(null);
    try {
      // Continue through the existing website's recovery-token flow.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${SITE_URL}/reset-password` });
      if (resetError) { setError("تعذّر إرسال الرابط الآن. حاول مرة أخرى بعد قليل."); return; }
      setSent(true);
    } catch { setError("تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى."); }
    finally { setSubmitting(false); }
  }
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}><BrandLogo width={160} /></View>
          <View style={styles.card}>
            {sent ? <>
              <Ionicons name="mail-open-outline" size={42} color={colors.goldDark} style={styles.centered} />
              <Text accessibilityRole="header" style={styles.title}>راجع بريدك</Text>
              <Text accessibilityLiveRegion="polite" style={styles.description}>إذا كان البريد مرتبطًا بحساب، ستصلك رسالة تحتوي رابط الاستعادة. افتح الرابط لإتمام التغيير على موقع متقن، ثم عُد لتسجيل الدخول.</Text>
            </> : <>
              <Text accessibilityRole="header" style={styles.title}>استعادة كلمة المرور</Text>
              <Text style={styles.description}>أدخل بريدك لإرسال رابط الاستعادة</Text>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput accessibilityLabel="البريد الإلكتروني" style={styles.input} value={email} onChangeText={setEmail} editable={!submitting} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textAlign="left" placeholder="example@email.com" placeholderTextColor={colors.inkSoft} returnKeyType="send" onSubmitEditing={sendResetLink} />
              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
              <TouchableOpacity accessibilityRole="button" onPress={sendResetLink} disabled={submitting} style={[styles.button, submitting && { opacity: 0.6 }]}>
                {submitting ? <ActivityIndicator color="#2E2418" /> : <Text style={styles.buttonText}>إرسال رابط الاستعادة</Text>}
              </TouchableOpacity>
            </>}
            <TouchableOpacity accessibilityRole="link" onPress={() => router.replace("/login")} style={styles.back}><Text style={styles.backText}>العودة إلى تسجيل الدخول</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function getStyles(colors: Palette) {
  return StyleSheet.create({
    flex: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.bg },
    content: { flexGrow: 1, justifyContent: "center", padding: 20, gap: 24 },
    brand: { alignItems: "center" }, centered: { alignSelf: "center" },
    card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.xl, padding: 22, gap: 14 },
    title: { fontFamily: fonts.extraBold, fontSize: 23, textAlign: "center", color: colors.ink },
    description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 24, color: colors.inkSoft, textAlign: "center" },
    label: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
    input: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.card, color: colors.ink, fontFamily: fonts.regular, fontSize: 15, writingDirection: "ltr" },
    error: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, textAlign: "center", lineHeight: 22 },
    button: { backgroundColor: colors.gold, minHeight: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center", padding: 12 },
    buttonText: { fontFamily: fonts.bold, color: "#2E2418", fontSize: 15, textAlign: "center" },
    back: { minHeight: 48, alignItems: "center", justifyContent: "center" },
    backText: { fontFamily: fonts.bold, color: colors.goldDark, fontSize: 14, textAlign: "center" },
  });
}
