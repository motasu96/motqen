import { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { homeRouteFor, useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { fonts, Palette, useTheme } from "../lib/theme";
import { arabicRow } from "../components/student/ui";

export default function LoginScreen() {
  const { session, role, loading: sessionLoading } = useAuth();
  const { colors } = useTheme();
  const s = getStyles(colors);
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sessionLoading && session && role) return <Redirect href={homeRouteFor(role)} />;

  async function handleLogin() {
    if (submitting) return;
    if (!email.trim() || !password) { setError("أدخل البريد الإلكتروني وكلمة المرور للمتابعة."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError || !data.user) {
        setError(signInError?.code === "invalid_credentials" ? "البريد أو كلمة المرور غير صحيحة. تحقق منهما وحاول مجددًا." : "تعذّر تسجيل الدخول. تحقق من الاتصال وتأكيد بريدك، ثم حاول مجددًا.");
        return;
      }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (profileError) { setError("تعذّر تحميل حسابك. حاول تسجيل الدخول مجددًا."); return; }
      if (profile?.role !== "student" && profile?.role !== "teacher" && profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("تعذّر تحديد نوع هذا الحساب. تواصل مع إدارة المنصة.");
      }
    } catch { setError("تعذّر الاتصال. تحقق من الإنترنت وحاول مجددًا."); }
    finally { setSubmitting(false); }
  }

  return <SafeAreaView style={s.screen}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.brand}>
          <View style={s.mark}><Ionicons name="book-outline" size={34} color={colors.primary} /></View>
          <Text style={s.logo}>متقن</Text><Text style={s.tagline}>مقرأة القرآن الكريم</Text>
        </View>
        <View style={s.welcome}>
          <Text accessibilityRole="header" style={s.title}>أهلًا بعودتك</Text>
          <Text style={s.subtitle}>لحظات مع القرآن، وأثر يبقى معك.</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>تسجيل الدخول</Text>
          <Text style={s.hint}>للطلاب والمعلمين وإدارة المنصة</Text>
          <View style={s.field}>
            <Text style={s.label}>البريد الإلكتروني</Text>
            <View style={[s.inputWrap, focused === "email" && s.focused]}>
              <Ionicons name="mail-outline" size={20} color={focused === "email" ? colors.primary : colors.inkSoft} />
              <TextInput accessibilityLabel="البريد الإلكتروني" style={s.input} value={email} onChangeText={setEmail}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} autoCapitalize="none" autoCorrect={false}
                autoComplete="email" keyboardType="email-address" textContentType="username" returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()} placeholder="example@email.com" placeholderTextColor={colors.inkSoft} />
            </View>
          </View>
          <View style={s.field}>
            <Text style={s.label}>كلمة المرور</Text>
            <View style={[s.inputWrap, focused === "password" && s.focused]}>
              <Ionicons name="lock-closed-outline" size={20} color={focused === "password" ? colors.primary : colors.inkSoft} />
              <TextInput ref={passwordRef} accessibilityLabel="كلمة المرور" style={s.input} value={password} onChangeText={setPassword}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} secureTextEntry={!showPassword}
                autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password"
                returnKeyType="go" onSubmitEditing={handleLogin} placeholder="أدخل كلمة المرور" placeholderTextColor={colors.inkSoft} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} accessibilityState={{ expanded: showPassword }}
                onPress={() => setShowPassword(!showPassword)} style={s.eye}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={colors.inkSoft} />
              </TouchableOpacity>
            </View>
          </View>
          {error ? <View accessibilityRole="alert" style={s.errorWrap}><Ionicons name="alert-circle-outline" size={19} color={colors.danger} /><Text style={s.error}>{error}</Text></View> : null}
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: submitting, busy: submitting }} onPress={handleLogin} disabled={submitting} activeOpacity={0.8} style={[s.button, submitting && { opacity: 0.65 }]}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={s.buttonText}>دخول إلى حسابي</Text><Ionicons name="log-in-outline" size={21} color="#FFFFFF" /></>}
          </TouchableOpacity>
          <View style={s.dividerRow}><View style={s.divider} /><Text style={s.hint}>جديد في متقن؟</Text><View style={s.divider} /></View>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/signup")} style={s.signup} activeOpacity={0.7}>
            <Text style={s.signupText}>إنشاء حساب طالب</Text><Ionicons name="person-add-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={s.footer}><Ionicons name="leaf-outline" size={15} color={colors.primary} /><Text style={s.footerText}>خطوة صغيرة اليوم، وإتقان يدوم.</Text></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
function getStyles(c: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    content: { flexGrow: 1, width: "100%", maxWidth: 520, alignSelf: "center", justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32, gap: 24 },
    brand: { alignItems: "center", gap: 5 },
    mark: { width: 74, height: 74, borderRadius: 25, backgroundColor: c.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 5 },
    logo: { fontFamily: fonts.extraBold, fontSize: 32, color: c.primary },
    tagline: { fontFamily: fonts.medium, fontSize: 13, color: c.inkSoft },
    welcome: { alignItems: "center", gap: 6 },
    title: { fontFamily: fonts.extraBold, fontSize: 28, color: c.ink, textAlign: "center" },
    subtitle: { fontFamily: fonts.regular, fontSize: 15, color: c.inkSoft, textAlign: "center", lineHeight: 24 },
    card: { borderRadius: 28, borderWidth: 1, borderColor: c.line, padding: 22, backgroundColor: c.card, gap: 14 },
    cardTitle: { fontFamily: fonts.extraBold, fontSize: 20, color: c.ink, textAlign: "right" },
    hint: { fontFamily: fonts.regular, fontSize: 12, color: c.inkSoft, textAlign: "right", lineHeight: 20 },
    field: { gap: 8, marginTop: 3 },
    label: { fontFamily: fonts.bold, fontSize: 14, color: c.ink, textAlign: "right" },
    inputWrap: { minHeight: 56, flexDirection: arabicRow, alignItems: "center", borderWidth: 1, borderColor: c.line, borderRadius: 15, paddingHorizontal: 12, backgroundColor: c.bg, gap: 10 },
    focused: { borderColor: c.primary, backgroundColor: c.card },
    input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, minHeight: 54, color: c.ink, textAlign: "right" },
    eye: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    button: { backgroundColor: "#245B49", minHeight: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: arabicRow, gap: 10, marginTop: 5, padding: 12 },
    buttonText: { fontFamily: fonts.bold, fontSize: 16, color: "#FFFFFF", textAlign: "center" },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
    divider: { height: 1, backgroundColor: c.line, flex: 1 },
    signup: { minHeight: 50, borderRadius: 15, borderWidth: 1, borderColor: c.line, flexDirection: arabicRow, alignItems: "center", justifyContent: "center", gap: 8, padding: 12 },
    signupText: { fontFamily: fonts.bold, fontSize: 14, color: c.primary },
    errorWrap: { flexDirection: arabicRow, alignItems: "center", gap: 8 },
    error: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 22, color: c.danger, textAlign: "right" },
    footer: { flexDirection: arabicRow, alignItems: "center", justifyContent: "center", gap: 6 },
    footerText: { fontFamily: fonts.regular, fontSize: 12, color: c.inkSoft, textAlign: "center" },
  });
}
