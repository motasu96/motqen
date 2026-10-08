import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTeacher } from "../../lib/teacherContext";
import { supabase } from "../../lib/supabase";
import { useLiveRooms } from "../../lib/presence";
import { normalizeWhatsAppNumber } from "../../lib/contact";
import { formatTimeSlot, TIME_SLOT_OPTIONS } from "../../lib/timeSlots";
import { listTeacherBookings, TeacherBooking } from "../../lib/staff/bookings";
import {
  getMyAvailableDays,
  getMyAvailableTimes,
  getMyWhatsApp,
  updateMyAvailableDays,
  updateMyAvailableTimes,
  updateMyWhatsApp,
} from "../../lib/staff/teacherStudents";
import { teacherRoomHref } from "../../lib/staff/roomLink";
import PulseBadge from "../../components/PulseBadge";
import { Button, Card, Chip, Empty, Field, Loading, Muted, Row, Screen, SectionTitle } from "../../components/staff/ui";

// Same Saturday-first order as the web schedule page (0 = Saturday), which
// is what teachers.available_days and group_sessions.day_of_week use.
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function TeacherSchedule() {
  const { teacherId, ready: teacherReady } = useTeacher();
  const router = useRouter();
  const liveRooms = useLiveRooms();

  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [days, setDays] = useState<number[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [ready, setReady] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) {
      if (teacherReady) setReady(true);
      return;
    }
    const [rows, t, d, w] = await Promise.all([
      listTeacherBookings(supabase, teacherId),
      getMyAvailableTimes(supabase, teacherId),
      getMyAvailableDays(supabase, teacherId),
      getMyWhatsApp(supabase, teacherId),
    ]);
    setBookings(rows);
    setTimes(t);
    setDays(d);
    setWhatsapp(w ? `+${w}` : "");
    setReady(true);
  }, [teacherId, teacherReady]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleTime = (hhmm: string) =>
    setTimes((prev) => (prev.includes(hhmm) ? prev.filter((v) => v !== hhmm) : [...prev, hhmm].sort()));
  const toggleDay = (i: number) =>
    setDays((prev) => (prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()));

  async function saveAvailability() {
    if (!teacherId) return;
    setSavingAvailability(true);
    const [okTimes, okDays] = await Promise.all([
      updateMyAvailableTimes(supabase, teacherId, times),
      updateMyAvailableDays(supabase, teacherId, days),
    ]);
    setSavingAvailability(false);
    Alert.alert(okTimes && okDays ? "تم" : "تعذّر الحفظ", okTimes && okDays ? "تم حفظ أوقاتك المتاحة" : "تعذّر حفظ الأوقات، حاول مرة أخرى");
  }

  async function saveWhatsapp() {
    if (!teacherId) return;
    const trimmed = whatsapp.trim();
    const normalized = trimmed ? normalizeWhatsAppNumber(trimmed) : null;
    if (trimmed && !normalized) {
      Alert.alert("رقم غير صالح", "أدخل الرقم بالصيغة الدولية مع رمز الدولة، مثل ‎+970599123456");
      return;
    }
    setSavingWhatsapp(true);
    const ok = await updateMyWhatsApp(supabase, teacherId, normalized);
    setSavingWhatsapp(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر حفظ الرقم، حاول مرة أخرى");
      return;
    }
    setWhatsapp(normalized ? `+${normalized}` : "");
    Alert.alert("تم", normalized ? "تم حفظ رقم التواصل" : "تم إخفاء رقمك عن الطلاب");
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today);
  const byDate = new Map<string, TeacherBooking[]>();
  for (const b of upcoming) byDate.set(b.date, [...(byDate.get(b.date) ?? []), b]);
  const dates = Array.from(byDate.keys()).sort();

  return (
    <Screen title="الجدول" subtitle="جدولك الأسبوعي مع الطلاب" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : !teacherId ? (
        <Empty>لا يوجد ملف معلم مرتبط بهذا الحساب.</Empty>
      ) : (
        <>
          <Card>
            <SectionTitle icon="time-outline">الأوقات المتاحة للحجز</SectionTitle>
            <Muted>اختر الأوقات التي تناسبك، وسيراها الطلاب عند حجز حصة معك</Muted>
            <Muted>الأيام المتاحة للحصص الفردية</Muted>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DAYS.map((label, i) => (
                <Chip key={label} label={label} active={days.includes(i)} onPress={() => toggleDay(i)} />
              ))}
            </View>
            <Muted>الأوقات المتاحة</Muted>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TIME_SLOT_OPTIONS.map((hhmm) => (
                <Chip key={hhmm} label={formatTimeSlot(hhmm)} active={times.includes(hhmm)} onPress={() => toggleTime(hhmm)} />
              ))}
            </View>
            <Button
              label="حفظ الأوقات"
              onPress={saveAvailability}
              loading={savingAvailability}
              disabled={times.length === 0}
              style={{ alignSelf: "flex-start" }}
            />
          </Card>

          <Card>
            <SectionTitle icon="logo-whatsapp">رقم واتساب للتواصل مع طلابك</SectionTitle>
            <Muted>
              اختياري — الحصص الفردية مدفوعة، وبإضافة رقمك يستطيع الطلاب الذين حجزوا معك أو اختاروك عند التسجيل التواصل معك
              مباشرة لمعرفة السعر وطرق الدفع. لا يظهر الرقم لأحد غيرهم، واتركه فارغًا لإخفائه.
            </Muted>
            <Field
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="+970599123456"
              keyboardType="phone-pad"
              autoComplete="tel"
              style={{ textAlign: "left", writingDirection: "ltr" }}
            />
            <Button label="حفظ الرقم" onPress={saveWhatsapp} loading={savingWhatsapp} style={{ alignSelf: "flex-start" }} />
          </Card>

          {dates.length === 0 ? (
            <Empty>لا توجد حصص</Empty>
          ) : (
            dates.map((date) => (
              <Card key={date}>
                <SectionTitle icon="calendar-outline">{date}</SectionTitle>
                {(byDate.get(date) ?? []).map((b) => (
                  <Row
                    key={b.id}
                    title={b.time}
                    subtitle={b.studentName || "—"}
                    trailing={
                      <View style={{ alignItems: "flex-end", gap: 6 }}>
                        {(liveRooms.get(b.id)?.studentCount ?? 0) > 0 && <PulseBadge color="red" label="مباشر الآن" />}
                        <Button
                          label="بدء الحصة"
                          icon="videocam-outline"
                          small
                          onPress={() => router.push(teacherRoomHref(b.id, b.studentName || "حصة مع طالب", false))}
                        />
                      </View>
                    }
                  />
                ))}
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}
