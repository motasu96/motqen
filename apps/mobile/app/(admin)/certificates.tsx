import { useCallback, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { programs } from "../../lib/programs";
import { amountShort, certificateTitle } from "../../lib/certificateFormat";
import { GRADE_LABEL_TEXT } from "../../lib/examsCertificates";
import { shareCertificatePdf } from "../../lib/certificateShare";
import { isIsoDate, todayIso } from "../../lib/staff/roomLink";
import {
  CertificateRow,
  CertScope,
  deleteCertificate,
  GRADE_LABELS,
  GradeLabel,
  issueCertificate,
  listAllCertificates,
  listStudentsForCertificates,
  StudentForCertificate,
} from "../../lib/staff/certificates";
import {
  Button,
  Card,
  ChipRow,
  Chip,
  Empty,
  Field,
  Loading,
  Muted,
  Pill,
  Row,
  Screen,
  SectionTitle,
  Segmented,
} from "../../components/staff/ui";
import { fonts, useTheme } from "../../lib/theme";

const MAX_SUGGESTIONS = 6;

export default function AdminCertificates() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const adminId = session?.user?.id ?? null;

  const [students, setStudents] = useState<StudentForCertificate[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [ready, setReady] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [studentId, setStudentId] = useState("");
  const [scope, setScope] = useState<CertScope>("parts");
  const [juzCount, setJuzCount] = useState("10");
  const [juzNames, setJuzNames] = useState("");
  const [programSlug, setProgramSlug] = useState(programs[0]?.slug ?? "");
  const [narration, setNarration] = useState("حفص عن عاصم");
  const [gradePercent, setGradePercent] = useState("");
  const [gradeLabel, setGradeLabel] = useState<GradeLabel | "">("");
  const [issuedAt, setIssuedAt] = useState(todayIso());
  const [issuing, setIssuing] = useState(false);

  const load = useCallback(async () => {
    const [studentRows, certRows] = await Promise.all([listStudentsForCertificates(supabase), listAllCertificates(supabase)]);
    setStudents(studentRows);
    setCertificates(certRows);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const selected = students.find((s) => s.studentId === studentId) ?? null;
  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return students.filter((s) => s.studentName.includes(q)).slice(0, MAX_SUGGESTIONS);
  }, [students, query]);

  async function issue() {
    const count = Number(juzCount);
    const percent = gradePercent.trim() ? Number(gradePercent) : null;
    if (!adminId || !selected || !isIsoDate(issuedAt)) {
      Alert.alert("بيانات ناقصة", "اختر الطالب واكتب تاريخ الإصدار بصيغة YYYY-MM-DD.");
      return;
    }
    if (scope === "parts" && !(Number.isInteger(count) && count >= 1 && count <= 30)) {
      Alert.alert("عدد الأجزاء غير صالح", "اكتب عدداً صحيحاً من 1 إلى 30.");
      return;
    }
    if (percent !== null && !(percent >= 0 && percent <= 100)) {
      Alert.alert("المعدل غير صالح", "اكتب نسبة من 0 إلى 100.");
      return;
    }
    if (!selected.teacherId) {
      Alert.alert("لا يوجد معلم", "لم يُحدَّد معلم لهذا الطالب بعد، لا يمكن إصدار شهادة له حاليًا.");
      return;
    }
    setIssuing(true);
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", adminId).maybeSingle();
    const ok = await issueCertificate(supabase, {
      studentId: selected.studentId,
      studentName: selected.studentName,
      studentGender: selected.studentGender,
      teacherId: selected.teacherId,
      teacherName: selected.teacherName,
      teacherGender: selected.teacherGender,
      issuedBy: adminId,
      issuedByName: (profile?.full_name as string | null) || "إدارة متقن",
      scope,
      programSlug: programSlug || null,
      narration: narration.trim() || "حفص عن عاصم",
      juzCount: scope === "parts" ? count : null,
      juzNames: scope === "parts" && juzNames.trim() ? juzNames.trim() : null,
      gradePercent: percent,
      gradeLabel: gradeLabel || null,
      issuedAt,
    });
    setIssuing(false);
    if (!ok) {
      Alert.alert("تعذّر الإصدار", "تعذّر إصدار الشهادة، حاول مرة أخرى.");
      return;
    }
    Alert.alert("تم", "تم إصدار الشهادة بنجاح");
    setQuery("");
    setStudentId("");
    setScope("parts");
    setJuzCount("10");
    setJuzNames("");
    setNarration("حفص عن عاصم");
    setGradePercent("");
    setGradeLabel("");
    setIssuedAt(todayIso());
    await load();
  }

  function confirmDelete(c: CertificateRow) {
    Alert.alert("حذف الشهادة", `هل أنت متأكد من حذف شهادة ${c.student_name}؟`, [
      { text: "تراجع", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          if (await deleteCertificate(supabase, c.id)) setCertificates((prev) => prev.filter((x) => x.id !== c.id));
          else Alert.alert("تعذّر الحذف", "حاول مرة أخرى.");
        },
      },
    ]);
  }

  async function share(c: CertificateRow) {
    setSharingId(c.id);
    await shareCertificatePdf(c, `شهادة ${c.student_name}`);
    setSharingId(null);
  }

  return (
    <Screen title="الشهادات" subtitle="إصدار شهادات إتمام الحفظ للطلاب ومتابعة الشهادات الصادرة" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : (
        <>
          <Card>
            <SectionTitle icon="ribbon-outline">إصدار شهادة جديدة</SectionTitle>

            {selected ? (
              <Row
                title={selected.studentName || "—"}
                subtitle={selected.teacherName ? `المعلم: ${selected.teacherName}` : "لا يوجد معلم لهذا الطالب بعد"}
                trailing={
                  <Button
                    label="تغيير"
                    variant="outline"
                    small
                    onPress={() => {
                      setStudentId("");
                      setQuery("");
                    }}
                  />
                }
              />
            ) : (
              <>
                <Field label="الطالب" placeholder="ابحث باسم الطالب" value={query} onChangeText={setQuery} />
                {query.trim() !== "" && suggestions.length === 0 ? <Muted>لا يوجد طالب بهذا الاسم.</Muted> : null}
                {suggestions.map((s) => (
                  <Row
                    key={s.studentId}
                    title={s.studentName || "—"}
                    subtitle={s.teacherName ? `المعلم: ${s.teacherName}` : "بدون معلم"}
                    onPress={() => setStudentId(s.studentId)}
                  />
                ))}
              </>
            )}

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>نوع الشهادة</Text>
            <Segmented
              value={scope}
              onChange={setScope}
              options={[
                { key: "parts", label: "حفظ أجزاء" },
                { key: "khatm", label: "ختم القرآن كاملًا" },
              ]}
            />
            {scope === "parts" && (
              <>
                <Field label="عدد الأجزاء (1–30)" value={juzCount} onChangeText={setJuzCount} keyboardType="numeric" />
                <Field
                  label="أسماء الأجزاء المحفوظة (اختياري)"
                  placeholder="مثال: الأجزاء 1 إلى 10، أو من سورة البقرة إلى سورة التوبة"
                  value={juzNames}
                  onChangeText={setJuzNames}
                  multiline
                />
              </>
            )}

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>البرنامج</Text>
            <ChipRow>
              {programs.map((p) => (
                <Chip key={p.slug} label={p.title} active={programSlug === p.slug} onPress={() => setProgramSlug(p.slug)} />
              ))}
            </ChipRow>

            <Field label="الرواية" value={narration} onChangeText={setNarration} />
            <Field label="تاريخ الإصدار" placeholder="YYYY-MM-DD" value={issuedAt} onChangeText={setIssuedAt} keyboardType="numbers-and-punctuation" />
            <Field label="المعدل % (اختياري)" value={gradePercent} onChangeText={setGradePercent} keyboardType="numeric" />

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>التقدير (اختياري)</Text>
            <ChipRow>
              <Chip label="بدون" active={gradeLabel === ""} onPress={() => setGradeLabel("")} />
              {GRADE_LABELS.map((g) => (
                <Chip key={g} label={GRADE_LABEL_TEXT[g]} active={gradeLabel === g} onPress={() => setGradeLabel(g)} />
              ))}
            </ChipRow>

            <Button label="إصدار الشهادة" icon="ribbon-outline" onPress={issue} loading={issuing} disabled={!selected} />
          </Card>

          <SectionTitle icon="documents-outline">الشهادات الصادرة</SectionTitle>
          {certificates.length === 0 ? (
            <Empty>لم تُصدَر أي شهادات بعد</Empty>
          ) : (
            certificates.map((c) => (
              <Card key={c.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <Text style={{ flex: 1, fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink, textAlign: "right" }}>
                    {c.student_name}
                  </Text>
                  <Pill label={c.certificate_number} />
                </View>
                <Muted>
                  {certificateTitle(c.scope)} — {amountShort(c.scope, c.juz_count)}
                  {c.grade_label ? ` · ${GRADE_LABEL_TEXT[c.grade_label] ?? c.grade_label}` : ""}
                  {c.grade_percent != null ? ` (${c.grade_percent}%)` : ""} · المعلم {c.teacher_name} · {c.issued_at}
                </Muted>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    label="عرض وتحميل PDF"
                    icon="share-outline"
                    small
                    loading={sharingId === c.id}
                    onPress={() => share(c)}
                  />
                  <Button label="حذف" variant="outline" small onPress={() => confirmDelete(c)} />
                </View>
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}
