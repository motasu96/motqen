import { useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { createLesson, LessonRow, updateLesson } from "../../lib/staff/lessons";
import { TeacherBooking } from "../../lib/staff/bookings";
import { Button, Field, Segmented } from "./ui";

// Port of LogLessonForm in the web TeacherSessionsWidget: after a 1:1
// session the teacher records attendance and what was covered.
export default function LogLessonForm({
  booking,
  teacherId,
  lesson,
  onSaved,
  onCancel,
}: {
  booking: TeacherBooking;
  teacherId: string;
  lesson?: LessonRow;
  onSaved: (bookingId: string, lesson: LessonRow) => void;
  onCancel: () => void;
}) {
  const [attended, setAttended] = useState(lesson?.attended ?? true);
  const [surah, setSurah] = useState(lesson?.surah ?? "");
  const [range, setRange] = useState(lesson?.ayah_range ?? "");
  const [notes, setNotes] = useState(lesson?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (attended && (!surah.trim() || !range.trim())) {
      Alert.alert("بيانات ناقصة", "الرجاء إدخال السورة ونطاق الآيات.");
      return;
    }
    setSaving(true);
    const params = { attended, surah: surah.trim(), ayahRange: range.trim(), notes: notes.trim() };
    const ok = lesson
      ? await updateLesson(supabase, lesson.id, params)
      : await createLesson(supabase, {
          bookingId: booking.id,
          studentId: booking.studentId,
          teacherId,
          sessionDate: booking.date,
          ...params,
        });
    setSaving(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر حفظ الدرس، حاول مرة أخرى.");
      return;
    }
    onSaved(booking.id, {
      id: lesson?.id ?? booking.id,
      booking_id: booking.id,
      student_id: booking.studentId,
      teacher_id: teacherId,
      session_date: booking.date,
      attended,
      surah: attended ? surah.trim() : null,
      ayah_range: attended ? range.trim() : null,
      notes: notes.trim() || null,
      created_at: lesson?.created_at ?? new Date().toISOString(),
    });
  }

  return (
    <View style={{ gap: 10 }}>
      <Segmented
        value={attended ? "yes" : "no"}
        onChange={(k) => setAttended(k === "yes")}
        options={[
          { key: "yes", label: "حضر" },
          { key: "no", label: "غاب" },
        ]}
      />
      {attended && (
        <>
          <Field placeholder="اسم السورة" value={surah} onChangeText={setSurah} />
          <Field placeholder="نطاق الآيات (مثال: من 120 إلى 145)" value={range} onChangeText={setRange} />
        </>
      )}
      <Field placeholder="ملاحظات (اختياري)" value={notes} onChangeText={setNotes} multiline />
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Button label="حفظ" onPress={handleSave} loading={saving} small />
        <Button label="إلغاء" onPress={onCancel} variant="outline" small />
      </View>
    </View>
  );
}
