import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { getStudentFileProfile, StudentFileProfile } from "../../lib/staff/students";
import { getCountryByIso } from "../../lib/countries";
import { getProgramBySlug } from "../../lib/programs";
import { normalizeWhatsAppNumber, openWhatsApp } from "../../lib/contact";
import { fonts, Palette, radius, useTheme } from "../../lib/theme";
import { Button, Loading, Muted } from "./ui";

const DAYS_SATURDAY_FIRST = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

// Port of the web StudentFileModal: the full registration record of a
// student, for the teacher (their own students) or the admin (anyone).
// Visibility is enforced by the database's row-level security, not here.
export default function StudentFileSheet({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [profile, setProfile] = useState<StudentFileProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getStudentFileProfile(supabase, studentId);
      if (!cancelled) {
        setProfile(data);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const student = profile?.student ?? null;
  const country = student?.country ? getCountryByIso(student.country) : undefined;
  const program = student?.program_slug ? getProgramBySlug(student.program_slug) : undefined;
  const days = (student?.preferred_days ?? [])
    .map((d) => {
      const i = Number(d);
      return Number.isInteger(i) && i >= 0 && i < DAYS_SATURDAY_FIRST.length ? DAYS_SATURDAY_FIRST[i] : d;
    })
    .join("، ");
  const whatsapp = profile?.phone ? normalizeWhatsAppNumber(profile.phone) : null;

  function row(label: string, value: string | null | undefined) {
    if (!value) return null;
    return (
      <View key={label} style={styles.row}>
        <Text style={styles.rowValue}>{value}</Text>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={20} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.title}>ملف الطالب</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {!ready ? (
            <Loading />
          ) : !student ? (
            <Muted>تعذّر العثور على بيانات هذا الطالب.</Muted>
          ) : (
            <>
              <View style={styles.card}>
                {row("الاسم الكامل", profile?.fullName)}
                {row("الجنس", student.gender === "male" ? "ذكر" : "أنثى")}
                {row("العمر", student.age ? String(student.age) : null)}
                {row("الدولة", country?.name ?? student.country)}
                {row("المدينة", student.city)}
                {row("رقم الجوال", profile?.phone)}
                {row("البريد الإلكتروني", student.email)}
                {row("البرنامج التعليمي", program?.title)}
                {row("أيام الحصص المفضلة", days || null)}
                {row("الوقت المفضل", student.preferred_time)}
                {row("المعلم المفضل", profile?.preferredTeacherName)}
                {student.plan_duration_months
                  ? [
                      row("مدة الخطة", `${student.plan_duration_months} أشهر`),
                      row("الأجزاء المحفوظة مسبقًا", String(student.already_memorized_juz)),
                      row("أيام المراجعة أسبوعيًا", student.review_days_per_week ? String(student.review_days_per_week) : null),
                      row(
                        "اتجاه الحفظ",
                        student.plan_direction === "fromStart"
                          ? "من أول القرآن"
                          : student.plan_direction === "fromEnd"
                          ? "من آخر القرآن"
                          : null
                      ),
                    ]
                  : null}
                {row("تاريخ التسجيل", student.created_at?.slice(0, 10))}
              </View>
              {whatsapp && (
                <Button
                  label="مراسلة الطالب عبر واتساب"
                  icon="logo-whatsapp"
                  variant="whatsapp"
                  onPress={() => openWhatsApp(whatsapp)}
                />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
    title: { flex: 1, fontFamily: fonts.extraBold, fontSize: 17, color: colors.ink, textAlign: "right" },
    close: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
    card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line },
    row: { flexDirection: "row", justifyContent: "space-between", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
    rowLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft },
    rowValue: { flex: 1, fontFamily: fonts.bold, fontSize: 13, color: colors.ink, textAlign: "left" },
  });
}
