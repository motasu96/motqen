import { useCallback, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTeacher } from "../../lib/teacherContext";
import { supabase } from "../../lib/supabase";
import { listStudentsWhoPreferredMe, listTeacherStudents, TeacherStudentOption } from "../../lib/staff/teacherStudents";
import { createExam, ExamRow, listStudentExams, recordExamScore } from "../../lib/staff/exams";
import { confirmMemorization } from "../../lib/staff/memorization";
import { getStudentPlan, updateStudentPlan } from "../../lib/staff/students";
import { isIsoDate, todayIso } from "../../lib/staff/roomLink";
import StudentFileSheet from "../../components/staff/StudentFileSheet";
import { Button, Card, Chip, ChipRow, Empty, Field, Loading, Pill, Screen, SectionTitle, Segmented } from "../../components/staff/ui";
import { useTheme, fonts } from "../../lib/theme";

const PLAN_DURATIONS = [
  { months: 6, label: "6 أشهر" },
  { months: 12, label: "سنة واحدة" },
  { months: 24, label: "سنتان" },
  { months: 36, label: "3 سنوات" },
];

function ExamScoreForm({ exam, onRecorded, onCancel }: { exam: ExamRow; onRecorded: (id: string, s: number, m: number) => void; onCancel?: () => void }) {
  const [score, setScore] = useState(exam.score != null ? String(exam.score) : "");
  const [maxScore, setMaxScore] = useState(exam.max_score != null ? String(exam.max_score) : "100");
  const [saving, setSaving] = useState(false);

  async function save() {
    const s = Number(score);
    const m = Number(maxScore);
    if (!score || !maxScore || !(s >= 0) || !(m > 0)) {
      Alert.alert("بيانات ناقصة", "الرجاء إدخال الدرجة والدرجة الكلية.");
      return;
    }
    setSaving(true);
    const ok = await recordExamScore(supabase, exam.id, s, m);
    setSaving(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر تسجيل النتيجة، حاول مرة أخرى.");
      return;
    }
    onRecorded(exam.id, s, m);
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 70 }}>
        <Field value={score} onChangeText={setScore} keyboardType="numeric" placeholder="الدرجة" />
      </View>
      <Text>/</Text>
      <View style={{ width: 70 }}>
        <Field value={maxScore} onChangeText={setMaxScore} keyboardType="numeric" placeholder="من" />
      </View>
      <Button label="حفظ" onPress={save} loading={saving} small />
      {onCancel && <Button label="إلغاء" onPress={onCancel} variant="outline" small />}
    </View>
  );
}

function StudentPlanPanel({ studentId, onSaved }: { studentId: string; onSaved: () => void }) {
  const [durationMonths, setDurationMonths] = useState<number | null>(null);
  const [juz, setJuz] = useState("0");
  const [reviewDays, setReviewDays] = useState<"1" | "2">("1");
  const [direction, setDirection] = useState<"fromStart" | "fromEnd">("fromEnd");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const current = await getStudentPlan(supabase, studentId);
      if (cancelled || !current) return;
      setDurationMonths(current.plan_duration_months);
      setJuz(String(current.already_memorized_juz ?? 0));
      setReviewDays(current.review_days_per_week === 2 ? "2" : "1");
      setDirection(current.plan_direction === "fromStart" ? "fromStart" : "fromEnd");
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  async function save() {
    if (!durationMonths) {
      Alert.alert("بيانات ناقصة", "الرجاء اختيار مدة الخطة.");
      return;
    }
    setSaving(true);
    const ok = await updateStudentPlan(supabase, studentId, {
      durationMonths,
      alreadyMemorizedJuz: Math.max(0, Math.min(29, Number(juz) || 0)),
      reviewDaysPerWeek: reviewDays === "2" ? 2 : 1,
      direction,
    });
    setSaving(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر حفظ خطة الحفظ، حاول مرة أخرى.");
      return;
    }
    Alert.alert("تم", "تم حفظ خطة الحفظ بنجاح.");
    onSaved();
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, textAlign: "right" }}>مدة الخطة</Text>
      <ChipRow>
        {PLAN_DURATIONS.map((d) => (
          <Chip key={d.months} label={d.label} active={durationMonths === d.months} onPress={() => setDurationMonths(d.months)} />
        ))}
      </ChipRow>
      <Field label="الأجزاء المحفوظة حاليًا (0–29)" value={juz} onChangeText={setJuz} keyboardType="numeric" />
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, textAlign: "right" }}>أيام المراجعة أسبوعيًا</Text>
      <Segmented
        value={reviewDays}
        onChange={setReviewDays}
        options={[
          { key: "1", label: "يوم واحد" },
          { key: "2", label: "يومان" },
        ]}
      />
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, textAlign: "right" }}>اتجاه الحفظ</Text>
      <Segmented
        value={direction}
        onChange={setDirection}
        options={[
          { key: "fromEnd", label: "من قصار السور" },
          { key: "fromStart", label: "من الفاتحة" },
        ]}
      />
      <Button label="تأكيد" onPress={save} loading={saving} small style={{ alignSelf: "flex-start" }} />
    </View>
  );
}

type Panel = "exam" | "memorization" | "plan" | null;

function StudentCard({ student, teacherId, preferred }: { student: TeacherStudentOption; teacherId: string; preferred?: boolean }) {
  const { colors } = useTheme();
  const [panel, setPanel] = useState<Panel>(null);
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [showFile, setShowFile] = useState(false);

  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState(todayIso());
  const [savingExam, setSavingExam] = useState(false);

  const [memTitle, setMemTitle] = useState("");
  const [memPages, setMemPages] = useState("");
  const [memDate, setMemDate] = useState(todayIso());
  const [savingMem, setSavingMem] = useState(false);

  useEffect(() => {
    if (preferred) return; // students who haven't booked yet have no exams to show
    let cancelled = false;
    (async () => {
      const rows = await listStudentExams(supabase, student.id);
      if (!cancelled) setExams(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [student.id, preferred]);

  async function createNewExam() {
    if (!examTitle.trim() || !isIsoDate(examDate)) {
      Alert.alert("بيانات ناقصة", "الرجاء تعبئة عنوان الاختبار وتاريخه بصيغة YYYY-MM-DD.");
      return;
    }
    setSavingExam(true);
    const ok = await createExam(supabase, { studentId: student.id, teacherId, title: examTitle.trim(), examDate });
    setSavingExam(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر إنشاء الاختبار، حاول مرة أخرى.");
      return;
    }
    setExamTitle("");
    setPanel(null);
    setExams(await listStudentExams(supabase, student.id));
  }

  async function saveMemorization() {
    const pages = Number(memPages);
    if (!memTitle.trim() || !isIsoDate(memDate) || !(pages > 0)) {
      Alert.alert("بيانات ناقصة", "الرجاء تعبئة العنوان وعدد الصفحات والتاريخ (YYYY-MM-DD).");
      return;
    }
    setSavingMem(true);
    const ok = await confirmMemorization(supabase, {
      studentId: student.id,
      teacherId,
      title: memTitle.trim(),
      pages,
      completedDate: memDate,
    });
    setSavingMem(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر تسجيل الحفظ، حاول مرة أخرى.");
      return;
    }
    setMemTitle("");
    setMemPages("");
    setPanel(null);
    Alert.alert("تم", "تم تسجيل الحفظ بنجاح.");
  }

  const toggle = (p: Exclude<Panel, null>) => setPanel(panel === p ? null : p);

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: fonts.extraBold, color: colors.goldDark }}>{student.name ? student.name[0] : "?"}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" }}>{student.name || "—"}</Text>
          {preferred && <Pill label="لم يحجز بعد" />}
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button label="ملف الطالب" icon="eye-outline" variant="outline" small onPress={() => setShowFile(true)} />
        {!preferred && <Button label="اختبار جديد" icon="document-text-outline" variant="outline" small onPress={() => toggle("exam")} />}
        {!preferred && <Button label="تأكيد حفظ" icon="checkmark-done-outline" variant="outline" small onPress={() => toggle("memorization")} />}
        <Button label="خطة الحفظ" icon="flag-outline" variant="outline" small onPress={() => toggle("plan")} />
      </View>

      {panel === "exam" && (
        <View style={{ gap: 10 }}>
          <Field placeholder="عنوان الاختبار" value={examTitle} onChangeText={setExamTitle} />
          <Field label="التاريخ" placeholder="YYYY-MM-DD" value={examDate} onChangeText={setExamDate} keyboardType="numbers-and-punctuation" />
          <Button label="إنشاء الاختبار" onPress={createNewExam} loading={savingExam} small style={{ alignSelf: "flex-start" }} />
        </View>
      )}
      {panel === "memorization" && (
        <View style={{ gap: 10 }}>
          <Field placeholder="عنوان الجزء/السورة" value={memTitle} onChangeText={setMemTitle} />
          <Field placeholder="الصفحات" value={memPages} onChangeText={setMemPages} keyboardType="numeric" />
          <Field label="التاريخ" placeholder="YYYY-MM-DD" value={memDate} onChangeText={setMemDate} keyboardType="numbers-and-punctuation" />
          <Button label="تأكيد" onPress={saveMemorization} loading={savingMem} small style={{ alignSelf: "flex-start" }} />
        </View>
      )}
      {panel === "plan" && <StudentPlanPanel studentId={student.id} onSaved={() => setPanel(null)} />}

      {exams.length > 0 && (
        <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 }}>
          {exams.map((exam) => (
            <View key={exam.id} style={{ gap: 6 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink, textAlign: "right" }}>
                {exam.title} — {exam.exam_date}
              </Text>
              {exam.status === "completed" && editingExamId !== exam.id ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Pill label={`مكتمل: ${exam.score} / ${exam.max_score}`} tone="green" />
                  <Button label="تعديل" onPress={() => setEditingExamId(exam.id)} variant="outline" small />
                </View>
              ) : (
                <ExamScoreForm
                  exam={exam}
                  onRecorded={(id, s, m) => {
                    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, status: "completed", score: s, max_score: m } : e)));
                    setEditingExamId(null);
                  }}
                  onCancel={exam.status === "completed" ? () => setEditingExamId(null) : undefined}
                />
              )}
            </View>
          ))}
        </View>
      )}

      {showFile && <StudentFileSheet studentId={student.id} onClose={() => setShowFile(false)} />}
    </Card>
  );
}

export default function TeacherStudents() {
  const { teacherId, ready: teacherReady } = useTeacher();
  const [students, setStudents] = useState<TeacherStudentOption[]>([]);
  const [preferred, setPreferred] = useState<TeacherStudentOption[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) {
      if (teacherReady) setReady(true);
      return;
    }
    const [rows, preferredRows] = await Promise.all([
      listTeacherStudents(supabase, teacherId),
      listStudentsWhoPreferredMe(supabase, teacherId),
    ]);
    const existing = new Set(rows.map((r) => r.id));
    setStudents(rows);
    setPreferred(preferredRows.filter((r) => !existing.has(r.id)));
    setReady(true);
  }, [teacherId, teacherReady]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen title="الطلاب" subtitle="جميع طلابك وحالة تقدمهم في برامجهم" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : (
        <>
          {preferred.length > 0 && teacherId && (
            <>
              <SectionTitle>طلاب اختاروك عند التسجيل</SectionTitle>
              {preferred.map((s) => (
                <StudentCard key={s.id} student={s} teacherId={teacherId} preferred />
              ))}
            </>
          )}
          {students.length === 0 || !teacherId ? (
            <Empty>لا يوجد طلاب حجزوا معك حصصًا بعد.</Empty>
          ) : (
            students.map((s) => <StudentCard key={s.id} student={s} teacherId={teacherId} />)
          )}
        </>
      )}
    </Screen>
  );
}
