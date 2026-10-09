import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { programs } from "../../lib/programs";
import {
  AdminOverviewStats,
  AdminRecentStudent,
  getAdminOverviewStats,
  getEnrollmentByProgram,
  listRecentStudents,
} from "../../lib/staff/adminOverview";
import { listPendingApplications } from "../../lib/staff/teacherApplications";
import { Button, Card, Empty, Loading, Muted, Pill, Row, Screen, SectionTitle, StatGrid, StatTile } from "../../components/staff/ui";
import { fonts, radius, useTheme } from "../../lib/theme";

const STATUS_LABEL: Record<AdminRecentStudent["status"], string> = { regular: "منتظم", late: "متأخر", struggling: "متعثر", new: "جديد" };
const STATUS_TONE: Record<AdminRecentStudent["status"], "green" | "gold" | "red" | "blue"> = {
  regular: "green",
  late: "gold",
  struggling: "red",
  new: "blue",
};

function delta(d: number | null) {
  return d === null ? undefined : `${d >= 0 ? "+" : ""}${d}% عن الشهر الماضي`;
}

export default function AdminHome() {
  const { colors } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [enrollment, setEnrollment] = useState<Record<string, number>>({});
  const [pending, setPending] = useState(0);
  const [recent, setRecent] = useState<AdminRecentStudent[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const [s, e, apps, r] = await Promise.all([
      getAdminOverviewStats(supabase),
      getEnrollmentByProgram(supabase),
      listPendingApplications(supabase),
      listRecentStudents(supabase, 5),
    ]);
    setStats(s);
    setEnrollment(e);
    setPending(apps.length);
    setRecent(r);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const entries = programs
    .map((p) => ({ title: p.title, count: enrollment[p.slug] ?? 0 }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxEnrolled = Math.max(1, ...entries.map((e) => e.count));
  const n = (v: number) => v.toLocaleString("en-US");

  return (
    <Screen title="لوحة تحكم المدير" subtitle="نظرة شاملة على أداء منصة متقن" onRefresh={load}>
      {!ready || !stats ? (
        <Loading />
      ) : (
        <>
          <StatGrid>
            <StatTile icon="people-outline" value={n(stats.totalStudents.value)} label={`إجمالي الطلاب${delta(stats.totalStudents.deltaPercent) ? ` · ${delta(stats.totalStudents.deltaPercent)}` : ""}`} />
            <StatTile icon="school-outline" value={n(stats.totalTeachers.value)} label={`إجمالي المعلمين${delta(stats.totalTeachers.deltaPercent) ? ` · ${delta(stats.totalTeachers.deltaPercent)}` : ""}`} />
            <StatTile icon="book-outline" value={n(programs.length)} label="البرامج النشطة" />
            <StatTile icon="calendar-outline" value={n(stats.monthlyBookings.value)} label={`الحجوزات الشهرية${delta(stats.monthlyBookings.deltaPercent) ? ` · ${delta(stats.monthlyBookings.deltaPercent)}` : ""}`} />
          </StatGrid>

          {pending > 0 && (
            <Card>
              <SectionTitle icon="person-add-outline">طلبات انضمام قيد المراجعة</SectionTitle>
              <Muted>{pending === 1 ? "هناك طلب انضمام معلم واحد بانتظار المراجعة." : `هناك ${pending} طلبات انضمام معلمين بانتظار المراجعة.`}</Muted>
              <Button label="عرض الطلبات" variant="outline" onPress={() => router.push("/(admin)/teachers")} />
            </Card>
          )}

          <Card>
            <SectionTitle icon="stats-chart-outline">عدد المسجلين حسب البرنامج</SectionTitle>
            {entries.length === 0 ? (
              <Empty>لا توجد تسجيلات بعد.</Empty>
            ) : (
              entries.map((e) => (
                <View key={e.title} style={{ gap: 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.ink }}>{e.title}</Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark }}>{e.count}</Text>
                  </View>
                  <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.bg, overflow: "hidden" }}>
                    <View style={{ height: "100%", borderRadius: radius.pill, backgroundColor: colors.gold, width: `${(e.count / maxEnrolled) * 100}%` }} />
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card>
            <SectionTitle icon="people-outline">أحدث الطلاب المسجلين</SectionTitle>
            {recent.length === 0 ? (
              <Empty>لا يوجد طلاب بعد.</Empty>
            ) : (
              recent.map((s) => (
                <Row
                  key={s.id}
                  title={s.name || "—"}
                  subtitle={`${programs.find((p) => p.slug === s.programSlug)?.title ?? "—"} · ${s.joinDate.slice(0, 10)}`}
                  trailing={<Pill label={STATUS_LABEL[s.status]} tone={STATUS_TONE[s.status]} />}
                  onPress={() => router.push("/(admin)/students")}
                />
              ))
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}
