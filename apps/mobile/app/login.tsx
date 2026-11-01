import { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import BrandLogo from "../components/BrandLogo";
import { homeRouteFor, useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

export default function LoginScreen() {
  const { session, role, loading: sessionLoading } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const passwordInput = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!sessionLoading && session && role) return <Redirect href={homeRouteFor(role)} />;

  async function handleLogin() {
    if (submitting) return;
    if (!email.trim() || !password) { setError("أدخل البريد الإلكتروني وكلمة المرور"); return; }
    setSubmitting(true); setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError || !data.user) { setError("تعذّر تسجيل الدخول. تحقق من بياناتك واتصالك بالإنترنت."); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (profile?.role !== "student" && profile?.role !== "teacher" && profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("تعذّر تحديد نوع هذا الحساب. تواصل مع إدارة المنصة.");
      }
    } catch { setError("تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى."); }
    finally { setSubmitting(false); }
  }
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.welcome}>
            <BrandLogo width={160} />
            <Text accessibilityRole="header" style={styles.title}>أهلًا بك في متقن</Text>
            <Text style={styles.subtitle}>رحلتك مع القرآن تبدأ من هنا</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput accessibilityLabel="البريد الإلكتروني" style={styles.input} value={email} onChangeText={setEmail} editable={!submitting} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" textAlign="left" returnKeyType="next" onSubmitEditing={() => passwordInput.current?.focus()} placeholder="example@email.com" placeholderTextColor={colors.inkSoft} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.passwordWrap}>
                <TextInput ref={passwordInput} accessibilityLabel="كلمة المرور" style={styles.passwordInput} value={password} onChangeText={setPassword} editable={!submitting} secureTextEntry={!showPassword} autoComplete="current-password" autoCapitalize="none" autoCorrect={false} textAlign="left" returnKeyType="go" onSubmitEditing={handleLogin} placeholder="••••••••" placeholderTextColor={colors.inkSoft} />
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} onPress={() => setShowPassword(value => !value)} style={styles.reveal}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={colors.goldDark} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity accessibilityRole="link" onPress={() => router.push("/forgot-password")} style={styles.textButton}><Text style={styles.linkText}>نسيت كلمة المرور؟</Text></TouchableOpacity>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: submitting, busy: submitting }} onPress={handleLogin} disabled={submitting} activeOpacity={0.85} style={[styles.button, submitting && styles.disabled]}>
              {submitting ? <ActivityIndicator color="#2E2418" /> : <Text style={styles.buttonText}>دخول</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity accessibilityRole="link" onPress={() => router.push("/signup")} activeOpacity={0.8} style={styles.signup}><Text style={styles.signupText}>طالب جديد؟ إنشاء حساب</Text></TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function getStyles(colors: Palette) {
  return StyleSheet.create({
    flex: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.bg },
    content: { flexGrow: 1, justifyContent: "center", padding: 20, paddingVertical: 28, gap: 18 },
    welcome: { alignItems: "center", gap: 8, marginBottom: 4 },
    title: { fontFamily: fonts.extraBold, fontSize: 25, color: colors.ink, textAlign: "center", marginTop: 8 },
    subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, textAlign: "center" },
    card: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 22, gap: 8, ...shadow.soft },
    field: { gap: 8, marginBottom: 12 }, label: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
    input: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.card, color: colors.ink, fontFamily: fonts.regular, fontSize: 15, writingDirection: "ltr" },
    passwordWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.card },
    passwordInput: { flex: 1, minHeight: 52, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontFamily: fonts.regular, fontSize: 15, writingDirection: "ltr" },
    reveal: { minWidth: 48, minHeight: 52, alignItems: "center", justifyContent: "center" },
    textButton: { minHeight: 48, alignItems: "center", justifyContent: "center" },
    linkText: { fontFamily: fonts.medium, fontSize: 14, color: colors.goldDark, textAlign: "center" },
    error: { color: colors.danger, fontFamily: fonts.medium, fontSize: 13, textAlign: "center", marginBottom: 10, lineHeight: 21 },
    button: { backgroundColor: colors.gold, borderRadius: radius.md, paddingVertical: 14, minHeight: 52, alignItems: "center", justifyContent: "center" },
    buttonText: { color: "#2E2418", fontFamily: fonts.extraBold, fontSize: 16 }, disabled: { opacity: 0.6 },
    signup: { minHeight: 54, padding: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg },
    signupText: { fontFamily: fonts.bold, fontSize: 15, color: colors.goldDark, textAlign: "center" },
  });
}
