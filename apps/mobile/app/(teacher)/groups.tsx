import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTeacher } from "../../lib/teacherContext";
import { supabase } from "../../lib/supabase";
import { useLiveRooms } from "../../lib/presence";
import { programs } from "../../lib/programs";
import { createGroup, deleteGroup, GroupWithMembers, listTeacherGroups } from "../../lib/staff/groups";
import {
  getGroupAttendanceForDate,
  listGroupAttendanceDates,
  saveGroupAttendance,
  StudentAttendance,
} from "../../lib/staff/groupAttendance";
import { isIsoDate, teacherRoomHref, todayIso } from "../../lib/staff/roomLink";
import PulseBadge from "../../components/PulseBadge";
import { Button, Card, Chip, ChipRow, Empty, Field, Loading, Muted, Pill, Screen, Segmented } from "../../components/staff/ui";
import { fonts, Palette, radius, useTheme } from "../../lib/theme";

const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const TIME_SLOTS = ["4:00 م", "5:30 م", "7:00 م", "8:30 م"];

const BLANK: StudentAttendance = { attended: true, recitationFrom: "", recitationTo: "", grade: "", notes: "" };

function GroupAttendancePanel({
  group,
  teacherId,
  initialDate,
  onClose,
}: {
  group: GroupWithMembers;
  teacherId: string;
  initialDate?: string;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const [sessionDate, setSessionDate] = useState(initialDate ?? todayIso());
  const [records, setRecords] = useState<Map<string, StudentAttendance>>(new Map());
  const [loggedDates, setLoggedDates] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadForDate = useCallback(
    async (date: string) => {
      setReady(false);
      const existing = await getGroupAttendanceForDate(supabase, group.id, date);
      const merged = new Map<string, StudentAttendance>();
      for (const m of group.enrolledMembers) merged.set(m.id, existing.get(m.id) ?? BLANK);
      setRecords(merged);
      setReady(true);
    },
    [group.id, group.enrolledMembers]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const dates = await listGroupAttendanceDates(supabase, group.id);
      if (cancelled) return;
      setLoggedDates(dates);
      await loadForDate(initialDate ?? todayIso());
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  function patch(studentId: string, change: Partial<StudentAttendance>) {
    setRecords((prev) => new Map(prev).set(studentId, { ...(prev.get(studentId) ?? BLANK), ...change }));
  }

  async function selectDate(date: string) {
    setSessionDate(date);
    if (isIsoDate(date)) await loadForDate(date);
  }

  async function save() {
    if (!isIsoDate(sessionDate)) {
      Alert.alert("تاريخ غير صالح", "اكتب التاريخ بصيغة YYYY-MM-DD.");
      return;
    }
    setSaving(true);
    const ok = await saveGroupAttendance(supabase, {
      groupId: group.id,
      teacherId,
      sessionDate,
      records: group.enrolledMembers.map((m) => {
        const r = records.get(m.id) ?? BLANK;
        return { studentId: m.id, attended: r.attended, recitationFrom: r.recitationFrom, recitationTo: r.recitationTo, grade: r.grade, notes: r.notes };
      }),
    });
    setSaving(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر حفظ الحضور، حاول مرة أخرى.");
      return;
    }
    Alert.alert("تم", "تم حفظ حضور الحلقة.");
    setLoggedDates((prev) => (prev.includes(sessionDate) ? prev : [...prev, sessionDate].sort().reverse()));
  }

  return (
    <View style={{ gap: 12, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink }}>تسجيل حضور الحلقة</Text>
        <Button label="إغلاق" variant="outline" small onPress={onClose} />
      </View>
      <Field label="تاريخ الحصة" placeholder="YYYY-MM-DD" value={sessionDate} onChangeText={selectDate} keyboardType="numbers-and-punctuation" />

      {group.enrolledMembers.length === 0 ? (
        <Muted>لا يوجد طلاب مسجَّلون في هذه الحلقة بعد.</Muted>
      ) : !ready ? (
        <Loading />
      ) : (
        group.enrolledMembers.map((m) => {
          const rec = records.get(m.id) ?? BLANK;
          return (
            <View key={m.id} style={{ gap: 8, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" }}>{m.name || "—"}</Text>
              <Segmented
                value={rec.attended ? "yes" : "no"}
                onChange={(k) => patch(m.id, { attended: k === "yes" })}
                options={[
                  { key: "yes", label: "حضر" },
                  { key: "no", label: "غاب" },
                ]}
              />
              {rec.attended && (
                <>
                  <Field placeholder="من (مثال: البقرة 120)" value={rec.recitationFrom} onChangeText={(v) => patch(m.id, { recitationFrom: v })} />
                  <Field placeholder="إلى (مثال: البقرة 145)" value={rec.recitationTo} onChangeText={(v) => patch(m.id, { recitationTo: v })} />
                  <Field placeholder="التقدير" value={rec.grade} onChangeText={(v) => patch(m.id, { grade: v })} />
                </>
              )}
            </View>
          );
        })
      )}

      <Button label="حفظ الحضور" onPress={save} loading={saving} disabled={group.enrolledMembers.length === 0} style={{ alignSelf: "flex-start" }} />

      {loggedDates.length > 0 && (
        <View style={{ gap: 8 }}>
          <Muted>سجلات سابقة</Muted>
          <ChipRow>
            {loggedDates.map((d) => (
              <Chip key={d} label={d} active={d === sessionDate} onPress={() => selectDate(d)} />
            ))}
          </ChipRow>
        </View>
      )}
    </View>
  );
}

function CreateGroupSheet({ teacherId, onClose, onCreated }: { teacherId: string; onClose: () => void; onCreated: () => void }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [programSlug, setProgramSlug] = useState(programs[0]?.slug ?? "");
  const [courseSlug, setCourseSlug] = useState("");
  const [day, setDay] = useState(0);
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [capacity, setCapacity] = useState("6");
  const [saving, setSaving] = useState(false);

  const program = programs.find((p) => p.slug === programSlug);

  async function create() {
    const cap = Number(capacity);
    if (!title.trim() || !programSlug || !(cap > 0)) {
      Alert.alert("بيانات ناقصة", "الرجاء تعبئة عنوان الحلقة والبرنامج.");
      return;
    }
    setSaving(true);
    const ok = await createGroup(supabase, {
      teacherId,
      title: title.trim(),
      titleEn: titleEn.trim(),
      programSlug,
      courseSlug: courseSlug || undefined,
      dayOfWeek: day,
      sessionTime: time,
      capacity: cap,
    });
    setSaving(false);
    if (!ok) {
      Alert.alert("تعذّر الحفظ", "تعذّر إنشاء الحلقة، حاول مرة أخرى.");
      return;
    }
    onCreated();
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={20} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>إنشاء حلقة جماعية جديدة</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
          <Field label="عنوان الحلقة" value={title} onChangeText={setTitle} />
          <Field label="عنوان الحلقة (إنجليزي)" value={titleEn} onChangeText={setTitleEn} style={{ textAlign: "left" }} />
          <Text style={styles.label}>البرنامج</Text>
          <View style={styles.wrap}>
            {programs.map((p) => (
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
          </View>
          {program?.courses && program.courses.length > 0 && (
            <>
              <Text style={styles.label}>الدورة (اختياري)</Text>
              <View style={styles.wrap}>
                <Chip label="بدون دورة محددة" active={courseSlug === ""} onPress={() => setCourseSlug("")} />
                {program.courses.map((c) => (
                  <Chip key={c.slug} label={c.title} active={courseSlug === c.slug} onPress={() => setCourseSlug(c.slug)} />
                ))}
              </View>
            </>
          )}
          <Text style={styles.label}>اليوم</Text>
          <View style={styles.wrap}>
            {DAYS.map((d, i) => (
              <Chip key={d} label={d} active={day === i} onPress={() => setDay(i)} />
            ))}
          </View>
          <Text style={styles.label}>الوقت</Text>
          <View style={styles.wrap}>
            {TIME_SLOTS.map((t) => (
              <Chip key={t} label={t} active={time === t} onPress={() => setTime(t)} />
            ))}
          </View>
          <Field label="السعة (عدد المقاعد)" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
          <Button label="إنشاء الحلقة" onPress={create} loading={saving} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function TeacherGroups() {
  const { colors } = useTheme();
  const router = useRouter();
  const { teacherId, ready: teacherReady } = useTeacher();
  const { openLog, date } = useLocalSearchParams<{ openLog?: string; date?: string }>();
  const liveRooms = useLiveRooms();

  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [ready, setReady] = useState(false);
  const [openAttendance, setOpenAttendance] = useState<string | null>(openLog ?? null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) {
      if (teacherReady) setReady(true);
      return;
    }
    setGroups(await listTeacherGroups(supabase, teacherId));
    setReady(true);
  }, [teacherId, teacherReady]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Arriving with ?openLog=<groupId> (after leaving a group room, or from
  // the attendance log) opens that group's attendance panel.
  useEffect(() => {
    if (openLog) setOpenAttendance(openLog);
  }, [openLog, date]);

  function confirmDelete(g: GroupWithMembers) {
    Alert.alert("حذف الحلقة", "هل أنت متأكد من حذف هذه الحلقة؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "حذف الحلقة",
        style: "destructive",
        onPress: async () => {
          if (await deleteGroup(supabase, g.id)) await load();
        },
      },
    ]);
  }

  return (
    <Screen
      title="الحصص الجماعية"
      subtitle="إدارة حلقاتك الجماعية والطلاب المسجلين فيها"
      onRefresh={load}
      right={teacherId ? <Button label="حلقة جديدة" icon="add" small onPress={() => setShowCreate(true)} /> : undefined}
    >
      {!ready ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Empty>لم تُنشئ أي حلقة جماعية بعد.</Empty>
      ) : (
        groups.map((g) => {
          const program = programs.find((p) => p.slug === g.program_slug);
          const course = program?.courses?.find((c) => c.slug === g.course_slug);
          return (
            <Card key={g.id}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    <Pill label={program?.title ?? "—"} />
                    {course && <Pill label={course.title} />}
                  </View>
                  <Text style={{ fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" }}>{g.title}</Text>
                  {(liveRooms.get(g.id)?.studentCount ?? 0) > 0 && <PulseBadge color="red" label="مباشر الآن" />}
                </View>
                <Pill label={`${g.enrolledCount} / ${g.capacity}`} />
              </View>
              <Muted>
                {DAYS[g.day_of_week] ?? ""} · {g.session_time} · السعة: {g.capacity}
              </Muted>
              <Muted>المسجلون: {g.enrolledNames.length ? g.enrolledNames.join("، ") : "—"}</Muted>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Button
                  label="بدء الحصة الجماعية"
                  icon="videocam-outline"
                  small
                  onPress={() => router.push(teacherRoomHref(g.id, g.title, true, "groups"))}
                />
                <Button
                  label="تسجيل الحضور"
                  variant="outline"
                  small
                  onPress={() => setOpenAttendance(openAttendance === g.id ? null : g.id)}
                />
                <Button label="حذف الحلقة" variant="outline" small onPress={() => confirmDelete(g)} />
              </View>
              {openAttendance === g.id && teacherId && (
                <GroupAttendancePanel
                  group={g}
                  teacherId={teacherId}
                  initialDate={openLog === g.id ? date : undefined}
                  onClose={() => setOpenAttendance(null)}
                />
              )}
            </Card>
          );
        })
      )}
      {showCreate && teacherId && (
        <CreateGroupSheet
          teacherId={teacherId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </Screen>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
    sheet: { flex: 1, backgroundColor: colors.bg },
    sheetHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
    sheetTitle: { flex: 1, fontFamily: fonts.extraBold, fontSize: 17, color: colors.ink, textAlign: "right" },
    close: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
    label: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" },
    wrap: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  });
}
