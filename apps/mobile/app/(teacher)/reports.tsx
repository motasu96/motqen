import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTeacher } from "../../lib/teacherContext";
import { supabase } from "../../lib/supabase";
import { getTeacherReportsData, TeacherReportsData } from "../../lib/staff/teacherOverview";
import { Card, Empty, Loading, Screen, SectionTitle, StatGrid, StatTile } from "../../components/staff/ui";
import { fonts, radius, useTheme } from "../../lib/theme";

const WEEKS_BACK = 4;

export default function TeacherReports() {
  const { colors } = useTheme();
  const { teacherId, ready: teacherReady } = useTeacher();
  const [data, setData] = useState<TeacherReportsData | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!teacherId) {
      if (teacherReady) setReady(true);
      return;
    }
    setData(await getTeacherReportsData(supabase, teacherId, WEEKS_BACK));
    setReady(true);
  }, [teacherId, teacherReady]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const maxSessions = data ? Math.max(1, ...data.weeklySessions) : 1;

  return (
    <Screen title="التقارير" subtitle="نظرة عامة على أدائك وأداء طلابك هذا الشهر" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : !teacherId ? (
        <Empty>لا يوجد ملف معلم مرتبط بهذا الحساب.</Empty>
      ) : (
        <>
          <StatGrid>
            <StatTile icon="trending-up-outline" value={data?.avgStudentProgress != null ? `${data.avgStudentProgress}%` : "—"} label="متوسط تقدم الطلاب" />
            <StatTile icon="checkmark-circle-outline" value={data?.attendanceRatePercent != null ? `${data.attendanceRatePercent}%` : "—"} label="نسبة الحضور" />
            <StatTile icon="star-outline" value={data?.rating != null ? `${data.rating} / 5` : "—"} label="تقييم الطلاب" />
            <StatTile icon="calendar-outline" value={data ? data.completedThisMonth.toLocaleString("en-US") : "—"} label="حصص مكتملة هذا الشهر" />
          </StatGrid>

          <Card>
            <SectionTitle icon="stats-chart-outline">الحصص الأسبوعية</SectionTitle>
            {(data?.weeklySessions ?? []).map((sessions, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ width: 62, fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" }}>
                  الأسبوع {i + 1}
                </Text>
                <View style={{ flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.bg, overflow: "hidden" }}>
                  <View
                    style={{ height: "100%", borderRadius: radius.pill, backgroundColor: colors.gold, width: `${(sessions / maxSessions) * 100}%` }}
                  />
                </View>
                <Text style={{ width: 58, fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "left" }}>{sessions} حصة</Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
