import { View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AccountPanel from "../../components/staff/AccountPanel";
import { Card, Row, Screen, SectionTitle } from "../../components/staff/ui";
import { useTheme } from "../../lib/theme";

const LINKS = [{ href: "/(admin)/certificates", title: "الشهادات", subtitle: "إصدار شهادات الحفظ ومتابعة الصادرة" }] as const;

export default function AdminMore() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Screen title="المزيد" subtitle="أقسام إضافية وحسابك">
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
      <AccountPanel roleLabel="مدير" />
    </Screen>
  );
}
