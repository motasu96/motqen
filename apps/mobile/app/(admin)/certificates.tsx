import { useCallback, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { programs } from "../../lib/programs";
import { certificateAmount, certificateTitle } from "../../lib/certificateFormat";
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
  listTeachersForCertificates,
  StudentForCertificate,
  TeacherForCertificate,
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
  const [teachers, setTeachers] = useState<TeacherForCertificate[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [ready, setReady] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [studentId, setStudentId] = useState("");
  const [scope, setScope] = useState<CertScope>("parts");
  const [juzCount, setJuzCount] = useState("10");
  const [juzNames, setJuzNames] = useState("");
  const [programSlug, setProgramSlug] = useState(programs[0]?.slug ?? "");
  const [courseSlug, setCourseSlug] = useState("");
  const [narration, setNarration] = useState("حفص عن عاصم");
  const [gradePercent, setGradePercent] = useState("");
  const [gradeLabel, setGradeLabel] = useState<GradeLabel | "">("");
  const [issuedAt, setIssuedAt] = useState(todayIso());
  const [issuing, setIssuing] = useState(false);

  const load = useCallback(async () => {
    const [studentRows, certRows, teacherRows] = await Promise.all([
      listStudentsForCertificates(supabase),
      listAllCertificates(supabase),
      listTeachersForCertificates(supabase),
    ]);
    setStudents(studentRows);
    setTeachers(teacherRows);
    setCertificates(certRows);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const selected = students.find((s) => s.studentId === studentId) ?? null;
  const selectedTeacher = teachers.find((tr) => tr.id === teacherId) ?? null;
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
    if (scope === "course" && !courseSlug) {
      Alert.alert("اختر الدورة", "اختر الدورة التي أتمّها الطالب.");
      return;
    }
    if (!selectedTeacher) {
      Alert.alert("اختر المعلم", "اختر المعلم الذي درّس الطالب.");
      return;
    }
    setIssuing(true);
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", adminId).maybeSingle();
    const ok = await issueCertificate(supabase, {
      studentId: selected.studentId,
      studentName: selected.studentName,
      studentGender: selected.studentGender,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      teacherGender: selectedTeacher.gender,
      issuedBy: adminId,
      issuedByName: (profile?.full_name as string | null) || "إدارة متقن",
      scope,
      programSlug: programSlug || null,
      courseSlug: scope === "course" ? courseSlug : null,
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
    setTeacherId("");
    setScope("parts");
    setJuzCount("10");
    setJuzNames("");
    setCourseSlug("");
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
                subtitle={selected.teacherName ? `آخر معلم حجز معه: ${selected.teacherName}` : "لم يحجز مع معلم بعد"}
                trailing={
                  <Button
                    label="تغيير"
                    variant="outline"
                    small
                    onPress={() => {
                      setStudentId("");
                      setTeacherId("");
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
                    onPress={() => {
                      setStudentId(s.studentId);
                      // Pre-select the teacher the student last booked with; the admin can change it.
                      setTeacherId(s.teacherId ?? "");
                    }}
                  />
                ))}
              </>
            )}

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>المعلم</Text>
            {teachers.length === 0 ? (
              <Muted>لا يوجد معلمون.</Muted>
            ) : (
              <ChipRow>
                {teachers.map((tr) => (
                  <Chip key={tr.id} label={tr.name} active={teacherId === tr.id} onPress={() => setTeacherId(tr.id)} />
                ))}
              </ChipRow>
            )}

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>نوع الشهادة</Text>
            <Segmented
              value={scope}
              onChange={(next) => {
                setScope(next);
                // A course certificate needs a program that has courses.
                if (next === "course" && !programs.find((p) => p.slug === programSlug)?.courses?.length) {
                  setProgramSlug(programs.find((p) => p.courses?.length)?.slug ?? programSlug);
                  setCourseSlug("");
                }
              }}
              options={[
                { key: "parts", label: "حفظ أجزاء" },
                { key: "khatm", label: "ختم القرآن" },
                { key: "course", label: "إتمام دورة" },
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
              {(scope === "course" ? programs.filter((p) => p.courses?.length) : programs).map((p) => (
                <Chip
                  key={p.slug}
                  label={p.title}
                  active={programSlug === p.slug}
                  onPress={() => {
                    setProgramSlug(p.slug);
                    setCourseSlug("");
                  }}
                />
              ))}
            </ChipRow>

            {scope === "course" && (
              <>
                <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>الدورة</Text>
                <ChipRow>
                  {(programs.find((p) => p.slug === programSlug)?.courses ?? []).map((c) => (
                    <Chip key={c.slug} label={c.title} active={courseSlug === c.slug} onPress={() => setCourseSlug(c.slug)} />
                  ))}
                </ChipRow>
              </>
            )}

            {scope !== "course" && <Field label="الرواية" value={narration} onChangeText={setNarration} />}
            <Field label="تاريخ الإصدار" placeholder="YYYY-MM-DD" value={issuedAt} onChangeText={setIssuedAt} keyboardType="numbers-and-punctuation" />
            <Field label="المعدل % (اختياري)" value={gradePercent} onChangeText={setGradePercent} keyboardType="numeric" />

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>التقدير (اختياري)</Text>
            <ChipRow>
              <Chip label="بدون" active={gradeLabel === ""} onPress={() => setGradeLabel("")} />
              {GRADE_LABELS.map((g) => (
                <Chip key={g} label={GRADE_LABEL_TEXT[g]} active={gradeLabel === g} onPress={() => setGradeLabel(g)} />
              ))}
            </ChipRow>

            <Button label="إصدار الشهادة" icon="ribbon-outline" onPress={issue} loading={issuing} disabled={!selected || !selectedTeacher} />
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
                  {certificateTitle(c.scope)} — {certificateAmount(c)}
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
