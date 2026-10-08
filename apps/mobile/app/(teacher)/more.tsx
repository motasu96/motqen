import { View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AccountPanel from "../../components/staff/AccountPanel";
import { Card, Row, Screen, SectionTitle } from "../../components/staff/ui";
import { useTheme } from "../../lib/theme";

const LINKS = [
  { href: "/(teacher)/groups", title: "الحصص الجماعية", subtitle: "إدارة حلقاتك وتسجيل الحضور" },
  { href: "/(teacher)/attendance-log", title: "سجل الطلاب", subtitle: "حضور الطلاب في الحلقات الجماعية" },
  { href: "/(teacher)/reports", title: "التقارير", subtitle: "أداؤك وتقدم طلابك" },
  { href: "/(teacher)/notices", title: "الإعلانات", subtitle: "تحديثات من إدارة المنصة" },
] as const;

export default function TeacherMore() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Screen title="المزيد" subtitle="باقي أدوات المعلم وحسابك">
      <Card>
        <SectionTitle icon="apps-outline">الأقسام</SectionTitle>
        <View style={{ gap: 10 }}>
          {LINKS.map((l) => (
            <Row
              key={l.href}
              title={l.title}
              subtitle={l.subtitle}
              onPress={() => router.push(l.href)}
              trailing={<Ionicons name="chevron-back" size={16} color={colors.inkSoft} />}
            />
          ))}
        </View>
      </Card>
      <AccountPanel roleLabel="معلم" />
    </Screen>
  );
}
