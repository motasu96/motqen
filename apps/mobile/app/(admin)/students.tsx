import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { programs } from "../../lib/programs";
import { AdminRecentStudent, listAllStudents } from "../../lib/staff/adminOverview";
import StudentFileSheet from "../../components/staff/StudentFileSheet";
import { Card, Empty, Field, Loading, Pill, Row, Screen } from "../../components/staff/ui";

const STATUS_LABEL: Record<AdminRecentStudent["status"], string> = { regular: "منتظم", late: "متأخر", struggling: "متعثر", new: "جديد" };
const STATUS_TONE: Record<AdminRecentStudent["status"], "green" | "gold" | "red" | "blue"> = {
  regular: "green",
  late: "gold",
  struggling: "red",
  new: "blue",
};

export default function AdminStudents() {
  const [students, setStudents] = useState<AdminRecentStudent[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [fileId, setFileId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStudents(await listAllStudents(supabase));
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return q ? students.filter((s) => s.name.includes(q) || s.teacherName.includes(q)) : students;
  }, [students, query]);

  return (
    <Screen title="الطلاب" subtitle="متابعة جميع طلاب المنصة وتقدمهم في البرامج" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : (
        <>
          <Field placeholder="ابحث باسم الطالب أو المعلم" value={query} onChangeText={setQuery} />
          <Card>
            {filtered.length === 0 ? (
              <Empty>لا يوجد طلاب.</Empty>
            ) : (
              filtered.map((s) => (
                <Row
                  key={s.id}
                  title={s.name || "—"}
                  subtitle={[
                    programs.find((p) => p.slug === s.programSlug)?.title,
                    s.teacherName ? `المعلم: ${s.teacherName}` : null,
                    s.progressPercent != null ? `التقدم ${s.progressPercent}%` : null,
                    s.joinDate.slice(0, 10),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  trailing={<Pill label={STATUS_LABEL[s.status]} tone={STATUS_TONE[s.status]} />}
                  onPress={() => setFileId(s.id)}
                />
              ))
            )}
          </Card>
        </>
      )}
      {fileId && <StudentFileSheet studentId={fileId} onClose={() => setFileId(null)} />}
    </Screen>
  );
}
