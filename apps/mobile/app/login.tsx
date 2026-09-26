import { useState } from "react";
import {
  ActivityIndicator,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { fonts, gradientFor, Palette, radius, shadow, useTheme } from "../lib/theme";

export default function LoginScreen() {
  const { session, loading: sessionLoading } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sessionLoading && session) {
    return <Redirect href="/(tabs)" />;
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("أدخل البريد الإلكتروني وكلمة المرور");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError("بيانات الدخول غير صحيحة، حاول مرة أخرى.");
    }
  }

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.logoMark}>
          <LinearGradient colors={gradientFor(colors)} style={styles.logoCircle}>
            <Ionicons name="book" size={30} color="#fff" />
          </LinearGradient>
          <Text style={styles.logo}>متقن</Text>
          <Text style={styles.tagline}>مقرأة القرآن الكريم</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>تسجيل الدخول إلى حسابك</Text>

          <View style={styles.field}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textAlign={I18nManager.isRTL ? "right" : "left"}
                placeholder="example@email.com"
                placeholderTextColor={colors.inkSoft}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.inkSoft} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign={I18nManager.isRTL ? "right" : "left"}
                placeholder="••••••••"
                placeholderTextColor={colors.inkSoft}
              />
            </View>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity onPress={handleLogin} disabled={submitting} activeOpacity={0.85}>
            <LinearGradient colors={gradientFor(colors)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>دخول</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, justifyContent: "center", padding: 20 },
  logoMark: { alignItems: "center", marginBottom: 28, gap: 4 },
  logoCircle: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logo: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.goldDark, textAlign: "center" },
  tagline: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 24, gap: 6, ...shadow.card },
  subtitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: "center", marginBottom: 18 },
  field: { marginBottom: 14 },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, marginBottom: 6, textAlign: "right" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  error: { color: colors.danger, fontFamily: fonts.medium, fontSize: 13, textAlign: "center", marginBottom: 10 },
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 15 },
  });
}
