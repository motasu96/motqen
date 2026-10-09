import { useCallback, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { listPendingApplications, rejectApplication, TeacherApplication } from "../../lib/staff/teacherApplications";
import { Button, Card, Empty, Loading, Muted, Pill, Screen, SectionTitle } from "../../components/staff/ui";
import { fonts, useTheme } from "../../lib/theme";

type TeacherListRow = {
  id: string;
  name: string;
  title: string | null;
  status: "active" | "suspended";
  specialties: string[] | null;
  years_experience: number;
  students_count: number;
  completed_sessions: number;
  rating: number;
};

export default function AdminTeachers() {
  const { colors } = useTheme();
  const [teachers, setTeachers] = useState<TeacherListRow[]>([]);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [ready, setReady] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [apps, { data }] = await Promise.all([
      listPendingApplications(supabase),
      supabase
        .from("teachers")
        .select("id, name, title, status, specialties, years_experience, students_count, completed_sessions, rating")
        .order("created_at", { ascending: false }),
    ]);
    setApplications(apps);
    setTeachers((data as TeacherListRow[]) ?? []);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmReject(app: TeacherApplication) {
    Alert.alert("رفض الطلب", `هل أنت متأكد من رفض طلب ${app.full_name}؟`, [
      { text: "تراجع", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: async () => {
          setActingOn(app.id);
          if (await rejectApplication(supabase, app)) await load();
          else Alert.alert("تعذّر التنفيذ", "تعذّر رفض الطلب، حاول مرة أخرى.");
          setActingOn(null);
        },
      },
    ]);
  }

  return (
    <Screen title="المعلمون" subtitle="إدارة معلمي ومعلمات المنصة ومتابعة أدائهم" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : (
        <>
          <Card>
            <SectionTitle icon="person-add-outline">طلبات انضمام قيد المراجعة</SectionTitle>
            {applications.length === 0 ? (
              <Empty>لا توجد طلبات انضمام جديدة حاليًا.</Empty>
            ) : (
              <>
                <Muted>قبول الطلبات وإنشاء حسابات المعلمين يتم من لوحة تحكم الموقع.</Muted>
                {applications.map((app) => (
                  <View key={app.id} style={{ gap: 6, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}>
                    <Text style={{ fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink, textAlign: "right" }}>{app.full_name}</Text>
                    <Muted>البريد: {app.email}</Muted>
                    <Muted>الجوال: {app.phone}</Muted>
                    {app.years_experience != null && <Muted>سنوات الخبرة: {app.years_experience}</Muted>}
                    {app.ijazah ? <Muted>الإجازة: {app.ijazah}</Muted> : null}
                    {app.specialties?.length ? <Muted>التخصصات: {app.specialties.join("، ")}</Muted> : null}
                    <Muted>نبذة: {app.bio}</Muted>
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                      <Button
                        label="رفض"
                        variant="danger"
                        small
                        loading={actingOn === app.id}
                        onPress={() => confirmReject(app)}
                      />
                      <Button label="فتح لوحة الموقع" variant="outline" small onPress={() => Linking.openURL("https://www.motqen.site/dashboard/admin/teachers")} />
                    </View>
                  </View>
                ))}
              </>
            )}
          </Card>

          <Card>
            <SectionTitle icon="school-outline">المعلمون الحاليون</SectionTitle>
            {teachers.length === 0 ? (
              <Empty>لا يوجد معلمون بعد.</Empty>
            ) : (
              teachers.map((t) => (
                <View key={t.id} style={{ gap: 6, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <Text style={{ flex: 1, fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink, textAlign: "right" }}>{t.name}</Text>
                    <Pill label={t.status === "active" ? "نشط" : "موقوف"} tone={t.status === "active" ? "green" : "red"} />
                  </View>
                  {t.title ? <Muted>{t.title}</Muted> : null}
                  <Muted>
                    {t.students_count} طالب · {t.completed_sessions} حصة · تقييم {t.rating} · خبرة {t.years_experience} سنة
                  </Muted>
                  {t.specialties?.length ? <Muted>{t.specialties.join("، ")}</Muted> : null}
                </View>
              ))
            )}
            <Muted>تعديل بيانات المعلمين وإيقافهم يتم من لوحة تحكم الموقع.</Muted>
          </Card>
        </>
      )}
    </Screen>
  );
}
