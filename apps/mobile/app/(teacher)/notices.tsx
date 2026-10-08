import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { listNoticesForAudience, NoticeRow } from "../../lib/staff/notices";
import { Card, Empty, Loading, Screen } from "../../components/staff/ui";
import { fonts, useTheme } from "../../lib/theme";

export default function TeacherNotices() {
  const { colors } = useTheme();
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    setNotices(await listNoticesForAudience(supabase, "teachers"));
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen title="الإعلانات" subtitle="آخر الإعلانات والتحديثات الموجهة للمعلمين" onRefresh={load}>
      {!ready ? (
        <Loading />
      ) : notices.length === 0 ? (
        <Empty>لا توجد إعلانات حاليًا.</Empty>
      ) : (
        notices.map((n) => (
          <Card key={n.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Text style={{ flex: 1, fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink, textAlign: "right" }}>{n.title}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft }}>{n.created_at.slice(0, 10)}</Text>
            </View>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", lineHeight: 21 }}>{n.body}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
