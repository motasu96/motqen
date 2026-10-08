import { useCallback, useState } from "react";
import { View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTeacher } from "../../lib/teacherContext";
import { supabase } from "../../lib/supabase";
import { useLiveRooms } from "../../lib/presence";
import {
  getTeacherOverviewStats,
  listTeacherRecentStudents,
  TeacherOverviewStats,
  TeacherRecentStudent,
} from "../../lib/staff/teacherOverview";
import { listTeacherBookings, TeacherBooking } from "../../lib/staff/bookings";
import { LessonRow, listTeacherLessonsByBooking } from "../../lib/staff/lessons";
import { teacherRoomHref } from "../../lib/staff/roomLink";
import LogLessonForm from "../../components/staff/LogLessonForm";
import PulseBadge from "../../components/PulseBadge";
import { Button, Card, Empty, Loading, Muted, Pill, Row, Screen, SectionTitle, StatGrid, StatTile } from "../../components/staff/ui";

const STATUS_LABEL: Record<TeacherRecentStudent["status"], string> = {
  regular: "منتظم",
  late: "متأخر",
  struggling: "متعثر",
  new: "جديد",
};
const STATUS_TONE: Record<TeacherRecentStudent["status"], "green" | "gold" | "red" | "blue"> = {
  regular: "green",
  late: "gold",
  struggling: "red",
  new: "blue",
};

function SessionToLog({
  booking,
  teacherId,
  lesson,
  autoOpen,
  onSaved,
}: {
  booking: TeacherBooking;
  teacherId: string;
  lesson?: LessonRow;
  autoOpen: boolean;
  onSaved: (bookingId: string, lesson: LessonRow) => void;
}) {
  const [open, setOpen] = useState(autoOpen);
  return (
    <View style={{ gap: 10 }}>
      <Row
        title={`${booking.date} — ${booking.time}`}
        subtitle={`مع ${booking.studentName || "—"}`}
        trailing={
          !open ? (
            lesson ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pill label={lesson.attended ? "حضر" : "غاب"} tone={lesson.attended ? "green" : "red"} />
                <Button label="تعديل" onPress={() => setOpen(true)} variant="outline" small />
              </View>
            ) : (
              <Button label="تسجيل الدرس" onPress={() => setOpen(true)} variant="outline" small />
            )
          ) : undefined
        }
      />
      {open && (
        <LogLessonForm
          booking={booking}
          teacherId={teacherId}
          lesson={lesson}
          onSaved={(id, l) => {
            onSaved(id, l);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    </View>
  );
}

export default function TeacherHome() {
  const { teacherId, name, ready: teacherReady } = useTeacher();
  const router = useRouter();
  const { openLog } = useLocalSearchParams<{ openLog?: string }>();
  const liveRooms = useLiveRooms();

  const [stats, setStats] = useState<TeacherOverviewStats | null>(null);
  const [recent, setRecent] = useState<TeacherRecentStudent[]>([]);
  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [lessons, setLessons] = useState<Map<string, LessonRow>>(new Map());
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) {
      if (teacherReady) setReady(true);
      return;
    }
    const [s, r, b, l] = await Promise.all([
      getTeacherOverviewStats(supabase, teacherId),
      listTeacherRecentStudents(supabase, teacherId),
      listTeacherBookings(supabase, teacherId),
      listTeacherLessonsByBooking(supabase, teacherId),
    ]);
    setStats(s);
    setRecent(r);
    setBookings(b);
    setLessons(l);
    setReady(true);
  }, [teacherId, teacherReady]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const today = new Date().toISOString().slice(0, 10);
  // A session the teacher just left via "log on leave" belongs in the
  // "to log" list immediately, even if it is still today by date alone.
  const isPast = (b: TeacherBooking) => b.date < today || b.id === openLog;
  const upcoming = bookings.filter((b) => !isPast(b));
  const past = bookings.filter(isPast);
  const needsLogging = past.filter((b) => !lessons.has(b.id));
  const logged = past.filter((b) => lessons.has(b.id)).reverse().slice(0, 10);

  function handleSaved(bookingId: string, lesson: LessonRow) {
    setLessons((prev) => new Map(prev).set(bookingId, lesson));
  }

  const n = (v: number | undefined) => (v === undefined ? "—" : v.toLocaleString("en-US"));

  return (
    <Screen title="لوحة المعلم" subtitle={name ? `مرحبًا ${name}` : "إدارة الطلاب ومتابعة تقدمهم"} onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : !teacherId ? (
        <Empty>لا يوجد ملف معلم مرتبط بهذا الحساب. تواصل مع إدارة المنصة.</Empty>
      ) : (
        <>
          <StatGrid>
            <StatTile icon="people-outline" value={n(stats?.totalStudents)} label="إجمالي الطلاب" />
            <StatTile icon="calendar-outline" value={n(stats?.todaySessions)} label="حصص اليوم" />
            <StatTile icon="clipboard-outline" value={n(stats?.pendingHomework)} label="واجبات بانتظار المراجعة" />
            <StatTile icon="stats-chart-outline" value={n(stats?.completedSessions)} label="حصص مكتملة" />
          </StatGrid>

          <Card>
            <SectionTitle icon="shield-checkmark-outline">الدخول المباشر</SectionTitle>
            <Muted>
              افتح غرفتك لاستقبال الطلاب مباشرة بلا حجز مسبق — الغرفة تبقى محمية، ويجب أن تقبل كل طالب يحاول الدخول بنفسك.
            </Muted>
            <Button
              label="فتح غرفتي المباشرة"
              icon="videocam-outline"
              onPress={() => router.push(teacherRoomHref(`teacher-${teacherId}`, "استقبال طلاب مباشر", false))}
            />
          </Card>

          <Card>
            <SectionTitle icon="people-circle-outline">حلقاتك الجماعية</SectionTitle>
            <Muted>أدر حلقاتك الجماعية وابدأ الحصة عند الموعد.</Muted>
            <Button label="عرض الحلقات" variant="outline" onPress={() => router.push("/(teacher)/groups")} />
          </Card>

          <Card>
            <SectionTitle icon="calendar-outline">الحصص القادمة</SectionTitle>
            {upcoming.length === 0 ? (
              <Empty>لا توجد حصص</Empty>
            ) : (
              upcoming.map((b) => (
                <Row
                  key={b.id}
                  title={`${b.date} — ${b.time}`}
                  subtitle={`مع ${b.studentName || "—"}`}
                  trailing={
                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                      {(liveRooms.get(b.id)?.studentCount ?? 0) > 0 && <PulseBadge color="red" label="مباشر الآن" />}
                      <Button
                        label="بدء الحصة"
                        icon="videocam-outline"
                        small
                        onPress={() => router.push(teacherRoomHref(b.id, "حصة مع طالب", true))}
                      />
                    </View>
                  }
                />
              ))
            )}
          </Card>

          {needsLogging.length > 0 && (
            <Card>
              <SectionTitle icon="time-outline">حصص بحاجة لتسجيل الدرس</SectionTitle>
              {needsLogging.map((b) => (
                <SessionToLog key={b.id} booking={b} teacherId={teacherId} autoOpen={b.id === openLog} onSaved={handleSaved} />
              ))}
            </Card>
          )}

          {logged.length > 0 && (
            <Card>
              <SectionTitle icon="checkmark-done-outline">الحصص المسجّلة</SectionTitle>
              {logged.map((b) => (
                <SessionToLog
                  key={b.id}
                  booking={b}
                  teacherId={teacherId}
                  lesson={lessons.get(b.id)}
                  autoOpen={false}
                  onSaved={handleSaved}
                />
              ))}
            </Card>
          )}

          <Card>
            <SectionTitle icon="people-outline">قائمة الطلاب</SectionTitle>
            {recent.length === 0 ? (
              <Empty>لا يوجد طلاب حجزوا معك حصصًا بعد.</Empty>
            ) : (
              recent.map((s) => (
                <Row
                  key={s.id}
                  title={s.name || "—"}
                  subtitle={`آخر حصة: ${s.lastSessionDate ?? "—"}`}
                  trailing={<Pill label={STATUS_LABEL[s.status]} tone={STATUS_TONE[s.status]} />}
                  onPress={() => router.push("/(teacher)/students")}
                />
              ))
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}
