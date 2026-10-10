import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, ColorValue, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeRouteFor, useAuth } from "../../lib/auth";
import { fonts, useTheme } from "../../lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} color={color} size={size} />
  );
}

export default function AdminLayout() {
  const { session, role, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }
  if (!session) return <Redirect href="/login" />;
  if (role !== "admin") return <Redirect href={homeRouteFor(role)} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: 62, paddingTop: 6, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="more" options={{ title: "المزيد", tabBarIcon: tabIcon("ellipsis-horizontal-circle", "ellipsis-horizontal-circle-outline") }} />
      <Tabs.Screen name="notices" options={{ title: "الإشعارات", tabBarIcon: tabIcon("notifications", "notifications-outline") }} />
      <Tabs.Screen name="students" options={{ title: "الطلاب", tabBarIcon: tabIcon("people", "people-outline") }} />
      <Tabs.Screen name="teachers" options={{ title: "المعلمون", tabBarIcon: tabIcon("school", "school-outline") }} />
      <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: tabIcon("home", "home-outline") }} />
      {/* Reached from "More"; not a tab of its own. */}
      <Tabs.Screen name="certificates" options={{ href: null }} />
    </Tabs>
  );
}
