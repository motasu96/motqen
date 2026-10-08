import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useTeacher } from "../../lib/teacherContext";
import { supabase } from "../../lib/supabase";
import { programs } from "../../lib/programs";
import { GroupWithMembers, listTeacherGroups } from "../../lib/staff/groups";
import { GroupAttendanceRow, listGroupAttendanceHistory } from "../../lib/staff/groupAttendance";
import { Card, Empty, Loading, Muted, Pill, Screen } from "../../components/staff/ui";
import { fonts, radius, useTheme } from "../../lib/theme";

export default function TeacherAttendanceLog() {
  const { colors } = useTheme();
  const router = useRouter();
  const { teacherId, ready: teacherReady } = useTeacher();
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [history, setHistory] = useState<Map<string, GroupAttendanceRow[]>>(new Map());
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) {
      if (teacherReady) setReady(true);
      return;
    }
    const rows = await listTeacherGroups(supabase, teacherId);
    const histories = await Promise.all(rows.map((g) => listGroupAttendanceHistory(supabase, g.id)));
    setGroups(rows);
    setHistory(new Map(rows.map((g, i) => [g.id, histories[i]])));
    setReady(true);
  }, [teacherId, teacherReady]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen title="سجل الطلاب" subtitle="سجل حضور كل طالب في حلقاتك الجماعية — اضغط على أي سجل لتعديله" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Empty>لم تُنشئ أي حلقة جماعية بعد.</Empty>
      ) : (
        groups.map((g) => {
          const program = programs.find((p) => p.slug === g.program_slug);
          const byStudent = new Map<string, GroupAttendanceRow[]>();
          for (const row of history.get(g.id) ?? []) byStudent.set(row.student_id, [...(byStudent.get(row.student_id) ?? []), row]);
          return (
            <Card key={g.id}>
              <Pill label={program?.title ?? "—"} />
              <Text style={{ fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" }}>{g.title}</Text>
              {g.enrolledMembers.length === 0 ? (
                <Muted>لا يوجد طلاب مسجَّلون في هذه الحلقة بعد.</Muted>
              ) : (
                g.enrolledMembers.map((m) => {
                  const entries = byStudent.get(m.id) ?? [];
                  const attended = entries.filter((e) => e.attended).length;
                  return (
                    <View key={m.id} style={{ gap: 8, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ink }}>{m.name || "—"}</Text>
                        {entries.length > 0 && <Pill label={`${attended}/${entries.length}`} />}
                      </View>
                      {entries.length === 0 ? (
                        <Muted>لا يوجد سجل بعد</Muted>
                      ) : (
                        entries.map((entry) => (
                          <TouchableOpacity
                            key={entry.id}
                            activeOpacity={0.7}
                            onPress={() =>
                              router.push({ pathname: "/(teacher)/groups", params: { openLog: g.id, date: entry.session_date } })
                            }
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor: colors.card,
                              borderRadius: radius.sm,
                              borderWidth: 1,
                              borderColor: colors.line,
                              paddingHorizontal: 10,
                              paddingVertical: 8,
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <Ionicons
                                name={entry.attended ? "checkmark-circle" : "close-circle"}
                                size={16}
                                color={entry.attended ? colors.success : colors.danger}
                              />
                              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink }}>{entry.session_date}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              {entry.grade ? <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark }}>{entry.grade}</Text> : null}
                              <Ionicons name="create-outline" size={14} color={colors.inkSoft} />
                            </View>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  );
                })
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
