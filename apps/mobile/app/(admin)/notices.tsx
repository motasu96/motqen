import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { createNotice, deleteNotice, listAllNotices, NoticeAudience, NoticeRow } from "../../lib/staff/notices";
import { Button, Card, Empty, Field, Loading, Pill, Screen, SectionTitle, Segmented } from "../../components/staff/ui";
import { fonts, useTheme } from "../../lib/theme";

const AUDIENCE_LABEL: Record<NoticeAudience, string> = { all: "الجميع", students: "الطلاب فقط", teachers: "المعلمون فقط" };

export default function AdminNotices() {
  const { colors } = useTheme();
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<NoticeAudience>("all");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setNotices(await listAllNotices(supabase));
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function publish() {
    if (!title.trim() || !body.trim()) {
      Alert.alert("بيانات ناقصة", "الرجاء كتابة عنوان الإعلان ونصه.");
      return;
    }
    setSaving(true);
    const ok = await createNotice(supabase, { title: title.trim(), body: body.trim(), audience });
    setSaving(false);
    if (!ok) {
      Alert.alert("تعذّر النشر", "تعذّر نشر الإعلان، حاول مرة أخرى.");
      return;
    }
    setTitle("");
    setBody("");
    setAudience("all");
    await load();
  }

  function confirmDelete(n: NoticeRow) {
    Alert.alert("حذف الإعلان", "هل أنت متأكد من حذف هذا الإعلان؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          if (await deleteNotice(supabase, n.id)) setNotices((prev) => prev.filter((x) => x.id !== n.id));
        },
      },
    ]);
  }

  return (
    <Screen title="الإعلانات" subtitle="الإعلانات الموجهة لجميع مستخدمي المنصة" onRefresh={load}>
      <Card>
        <SectionTitle icon="megaphone-outline">نشر إعلان جديد</SectionTitle>
        <Field placeholder="عنوان الإعلان" value={title} onChangeText={setTitle} />
        <Field placeholder="نص الإعلان" value={body} onChangeText={setBody} multiline />
        <Segmented
          value={audience}
          onChange={setAudience}
          options={[
            { key: "all", label: AUDIENCE_LABEL.all },
            { key: "students", label: AUDIENCE_LABEL.students },
            { key: "teachers", label: AUDIENCE_LABEL.teachers },
          ]}
        />
        <Button label="نشر الإعلان" onPress={publish} loading={saving} style={{ alignSelf: "flex-start" }} />
      </Card>

      {!ready ? (
        <Loading />
      ) : notices.length === 0 ? (
        <Empty>لا توجد إعلانات منشورة بعد.</Empty>
      ) : (
        notices.map((n) => (
          <Card key={n.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <Text style={{ flex: 1, fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink, textAlign: "right" }}>{n.title}</Text>
              <Pill label={AUDIENCE_LABEL[n.audience]} />
            </View>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 21 }}>{n.body}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft }}>{n.created_at.slice(0, 10)}</Text>
              <Button label="حذف" variant="outline" small onPress={() => confirmDelete(n)} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
