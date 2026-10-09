import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTeacher } from "../../lib/teacherContext";
import { supabase } from "../../lib/supabase";
import { listTeacherStudents, TeacherStudentOption } from "../../lib/staff/teacherStudents";
import { assignHomework, gradeHomework, HomeworkType, HomeworkWithStudent, listTeacherHomework } from "../../lib/staff/homework";
import { isIsoDate } from "../../lib/staff/roomLink";
import { Button, Card, Chip, Empty, Field, Loading, Pill, Screen, SectionTitle, Segmented } from "../../components/staff/ui";
import { fonts, useTheme } from "../../lib/theme";

const TYPE_LABEL: Record<HomeworkType, string> = { recitation: "تسميع", review: "مراجعة", tajweed: "تجويد" };
const STATUS_LABEL: Record<HomeworkWithStudent["status"], string> = {
  pending: "بانتظار التسليم",
  submitted: "تم التسليم",
  graded: "تم التصحيح",
};
const STATUS_TONE: Record<HomeworkWithStudent["status"], "gold" | "blue" | "green"> = {
  pending: "gold",
  submitted: "blue",
  graded: "green",
};

export default function TeacherHomework() {
  const { colors } = useTheme();
  const { teacherId, ready: teacherReady } = useTeacher();
  const [students, setStudents] = useState<TeacherStudentOption[]>([]);
  const [items, setItems] = useState<HomeworkWithStudent[]>([]);
  const [ready, setReady] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HomeworkType>("recitation");
  const [dueDate, setDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState("");

  const load = useCallback(async () => {
    if (!teacherId) {
      if (teacherReady) setReady(true);
      return;
    }
    const [studentRows, hwRows] = await Promise.all([listTeacherStudents(supabase, teacherId), listTeacherHomework(supabase, teacherId)]);
    setStudents(studentRows);
    setItems(hwRows);
    setReady(true);
  }, [teacherId, teacherReady]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function assign() {
    if (!teacherId || !studentId || !title.trim() || !isIsoDate(dueDate)) {
      Alert.alert("بيانات ناقصة", "الرجاء اختيار الطالب وكتابة العنوان وتاريخ التسليم بصيغة YYYY-MM-DD.");
      return;
    }
    setAssigning(true);
    const ok = await assignHomework(supabase, { studentId, teacherId, title: title.trim(), type, dueDate });
    setAssigning(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر تعيين الواجب، حاول مرة أخرى.");
      return;
    }
    setTitle("");
    setDueDate("");
    await load();
  }

  async function grade(id: string) {
    if (!gradeValue.trim()) return;
    const ok = await gradeHomework(supabase, id, gradeValue.trim());
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر تسجيل التقييم، حاول مرة أخرى.");
      return;
    }
    setItems((prev) => prev.map((h) => (h.id === id ? { ...h, status: "graded", grade: gradeValue.trim() } : h)));
    setGradingId(null);
    setGradeValue("");
  }

  return (
    <Screen title="الواجبات" subtitle="راجع واجبات طلابك المُرسلة وقيّمها" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : (
        <>
          {students.length > 0 && (
            <Card>
              <SectionTitle icon="add-circle-outline">تعيين واجب جديد</SectionTitle>
              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" }}>اختر الطالب</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {students.map((s) => (
                  <Chip key={s.id} label={s.name || "—"} active={studentId === s.id} onPress={() => setStudentId(s.id)} />
                ))}
              </View>
              <Segmented
                value={type}
                onChange={setType}
                options={[
                  { key: "recitation", label: TYPE_LABEL.recitation },
                  { key: "review", label: TYPE_LABEL.review },
                  { key: "tajweed", label: TYPE_LABEL.tajweed },
                ]}
              />
              <Field placeholder="عنوان الواجب" value={title} onChangeText={setTitle} />
              <Field label="تاريخ التسليم" placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} keyboardType="numbers-and-punctuation" />
              <Button label="تعيين الواجب" onPress={assign} loading={assigning} style={{ alignSelf: "flex-start" }} />
            </Card>
          )}

          {items.length === 0 ? (
            <Empty>لا توجد واجبات معيّنة بعد.</Empty>
          ) : (
            items.map((h) => (
              <Card key={h.id}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pill label={TYPE_LABEL[h.type]} />
                  <Pill label={STATUS_LABEL[h.status]} tone={STATUS_TONE[h.status]} />
                </View>
                <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" }}>{h.title}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" }}>
                  {h.studentName || "—"} · حتى {h.due_date}
                </Text>
                {gradingId === h.id ? (
                  <View style={{ gap: 8 }}>
                    <Field placeholder="التقييم (مثال: ممتاز)" value={gradeValue} onChangeText={setGradeValue} />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button label="اعتماد" onPress={() => grade(h.id)} small />
                      <Button label="إلغاء" onPress={() => setGradingId(null)} variant="outline" small />
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {h.grade ? <Text style={{ fontFamily: fonts.extraBold, color: colors.goldDark }}>{h.grade}</Text> : null}
                    {h.status === "submitted" || h.status === "graded" ? (
                      <Button
                        label={h.status === "submitted" ? "راجع الآن" : "تعديل"}
                        variant={h.status === "submitted" ? "primary" : "outline"}
                        small
                        onPress={() => {
                          setGradingId(h.id);
                          setGradeValue(h.grade ?? "");
                        }}
                      />
                    ) : null}
                  </View>
                )}
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}
