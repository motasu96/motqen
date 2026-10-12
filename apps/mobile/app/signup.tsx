import { useMemo, useState } from "react";
import { Alert, Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { homeRouteFor, useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { SITE_URL } from "../lib/site";
import { programs } from "../lib/programs";
import { COUNTRIES, Country } from "../lib/countries";
import { Button, Card, Chip, ChipRow, Field, Muted, Screen, SectionTitle, Segmented } from "../components/staff/ui";
import { useTheme } from "../lib/theme";

type StudentType = "male" | "female";

const CHILD_MAX_AGE = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FEATURED_COUNTRIES = COUNTRIES.slice(0, 12);

export default function SignupScreen() {
  const router = useRouter();
  const { session, role, loading } = useAuth();
  const { colors } = useTheme();

  const [studentType, setStudentType] = useState<StudentType>("male");
  const [ageText, setAgeText] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [name, setName] = useState("");
  const [countryIso, setCountryIso] = useState("SA");
  const [countryQuery, setCountryQuery] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const age = /^\d+$/.test(ageText.trim()) ? parseInt(ageText.trim(), 10) : null;
  const ageGroup: "child" | "adult" | null = age === null ? null : age <= CHILD_MAX_AGE ? "child" : "adult";
  const country: Country = COUNTRIES.find((c) => c.iso === countryIso) ?? COUNTRIES[0];

  // Only the programs that fit the student's gender and age (the women's
  // program is hidden from men, the children's from adults, and so on).
  const availablePrograms = useMemo(
    () =>
      programs.filter((p) => {
        if (p.category === "women") return studentType === "female";
        if (p.category === "children") return ageGroup === "child";
        if (p.category === "adults") return ageGroup === "adult";
        return true;
      }),
    [studentType, ageGroup]
  );
  const chosenProgram = availablePrograms.some((p) => p.slug === programSlug) ? programSlug : "";

  const visibleCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    const matches = q
      ? COUNTRIES.filter((c) => c.name.includes(countryQuery.trim()) || c.nameEn.toLowerCase().includes(q)).slice(0, 12)
      : FEATURED_COUNTRIES;
    return matches.some((c) => c.iso === country.iso) ? matches : [country, ...matches];
  }, [countryQuery, country]);

  // Already signed in (including right after a successful signup with no
  // email confirmation): go to the matching home.
  if (!loading && session && role) {
    return <Redirect href={homeRouteFor(role)} />;
  }

  function validate(): string | null {
    if (!age || age < 3 || age > 100) return "أدخل عمرًا صحيحًا";
    if (!chosenProgram) return "اختر البرنامج";
    if (!name.trim()) return "أدخل الاسم الكامل";
    if (!phone.trim()) return "أدخل رقم الهاتف";
    if (!EMAIL_RE.test(email.trim())) return "أدخل بريدًا إلكترونيًا صحيحًا";
    if (password.length < 6) return "كلمة المرور يجب ألا تقل عن 6 أحرف";
    if (password !== confirmPassword) return "كلمتا المرور غير متطابقتين";
    return null;
  }

  async function handleSignup() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);

    const fullPhone = `${country.dialCode}${phone.trim().replace(/^0+/, "")}`;
    const cleanEmail = email.trim();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: name.trim(), phone: fullPhone, country: country.iso, city: city.trim() },
      },
    });

    if (signUpError) {
      setSubmitting(false);
      setError(
        /registered|already/i.test(signUpError.message)
          ? "هذا البريد مسجّل مسبقًا. سجّل الدخول بدلًا من إنشاء حساب جديد."
          : "تعذّر إنشاء الحساب: " + signUpError.message
      );
      return;
    }

    // With email confirmation on, signing up with an address that already
    // has an account returns a user with no identities instead of an error.
    if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
      setSubmitting(false);
      setError("هذا البريد مسجّل مسبقًا. سجّل الدخول بدلًا من إنشاء حساب جديد.");
      return;
    }

    // Save the student's details (the website does the same after signUp).
    let detailsSaved = true;
    try {
      const response = await fetch(`${SITE_URL}/api/student-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
        },
        body: JSON.stringify({
          userId: data.user.id,
          gender: studentType,
          age,
          programSlug: chosenProgram,
          preferredDays: [],
          preferredTime: null,
          country: country.iso,
          city: city.trim(),
          email: cleanEmail,
          groupId: null,
          preferredTeacherId: null,
        }),
      });
      detailsSaved = response.ok;
    } catch {
      detailsSaved = false;
    }

    fetch(`${SITE_URL}/api/welcome-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: data.user.id, locale: "ar" }),
    }).catch(() => {});

    setSubmitting(false);

    if (!detailsSaved) {
      Alert.alert(
        "تم إنشاء حسابك",
        "لكن تعذّر حفظ بيانات تسجيلك (البرنامج والعمر). يمكنك المتابعة، وسنطلب منك إكمالها لاحقًا أو تواصل مع الإدارة."
      );
    }

    if (!data.session) {
      Alert.alert("تم إنشاء حسابك", "أرسلنا رسالة تأكيد إلى بريدك. افتحها وأكّد حسابك ثم سجّل الدخول.");
      router.replace("/login");
    }
    // With a session, the redirect above takes the student to their home.
  }

  return (
    <Screen title="إنشاء حساب طالب" subtitle="سجّل في دقيقتين وابدأ رحلتك مع القرآن">
      <Card style={{ gap: 14 }}>
        <SectionTitle icon="person-outline">البيانات الأساسية</SectionTitle>
        <Segmented
          options={[
            { key: "male", label: "طالب" },
            { key: "female", label: "طالبة" },
          ]}
          value={studentType}
          onChange={setStudentType}
        />
        <Field label="العمر" value={ageText} onChangeText={setAgeText} keyboardType="number-pad" placeholder="أدخل عمرك" maxLength={3} />
      </Card>

      <Card style={{ gap: 14 }}>
        <SectionTitle icon="book-outline">البرنامج</SectionTitle>
        {age === null ? (
          <Muted>أدخل العمر أولًا لتظهر لك البرامج المناسبة.</Muted>
        ) : (
          <ChipRow>
            {availablePrograms.map((p) => (
              <Chip key={p.slug} label={p.title} active={chosenProgram === p.slug} onPress={() => setProgramSlug(p.slug)} />
            ))}
          </ChipRow>
        )}
      </Card>

      <Card style={{ gap: 14 }}>
        <SectionTitle icon="mail-outline">بيانات الحساب</SectionTitle>
        <Field label="الاسم الكامل" value={name} onChangeText={setName} placeholder="الاسم" />

        <Field label="ابحث عن دولتك" value={countryQuery} onChangeText={setCountryQuery} placeholder="مثال: مصر" />
        <ChipRow>
          {visibleCountries.map((c) => (
            <Chip key={c.iso} label={c.name} active={countryIso === c.iso} onPress={() => setCountryIso(c.iso)} />
          ))}
        </ChipRow>

        <Field label="المدينة" value={city} onChangeText={setCity} placeholder="المدينة" />
        <Field
          label={`رقم الهاتف (${country.dialCode})`}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="5xxxxxxxx"
        />
        <Field
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="example@email.com"
        />
        <Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry placeholder="6 أحرف على الأقل" />
        <Field label="تأكيد كلمة المرور" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      </Card>

      {error ? <Text style={{ color: colors.danger, textAlign: "center", fontFamily: "Tajawal_500Medium" }}>{error}</Text> : null}

      <Button label="إنشاء الحساب" icon="checkmark-circle-outline" onPress={handleSignup} loading={submitting} />

      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ color: colors.inkSoft, fontSize: 12, textAlign: "center", lineHeight: 20 }}>
          بإنشاء الحساب فإنك توافق على{" "}
          <Text style={{ color: colors.goldDark }} onPress={() => Linking.openURL(`${SITE_URL}/terms`)}>
            الشروط والأحكام
          </Text>{" "}
          و
          <Text style={{ color: colors.goldDark }} onPress={() => Linking.openURL(`${SITE_URL}/privacy`)}>
            سياسة الخصوصية
          </Text>
          .
        </Text>
        <TouchableOpacity onPress={() => router.replace("/login")} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: colors.goldDark, fontFamily: "Tajawal_700Bold", fontSize: 14 }}>لدي حساب بالفعل؟ تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === "web" ? null : <View style={{ height: 24 }} />}
    </Screen>
  );
}
