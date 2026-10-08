import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, ColorValue, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeRouteFor, useAuth } from "../../lib/auth";
import { TeacherProvider, useTeacher } from "../../lib/teacherContext";
import { useTeacherOnlinePresence } from "../../lib/presence";
import { fonts, useTheme } from "../../lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} color={color} size={size} />
  );
}

// Marks the teacher "online" for as long as the teacher interface is open,
// the same signal the web dashboard sends (students see "متاح الآن").
function PresenceBeacon() {
  const { teacherId } = useTeacher();
  useTeacherOnlinePresence(teacherId);
  return null;
}

function TeacherTabs() {
  const { colors } = useTheme();
  return (
    <>
      <PresenceBeacon />
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
        <Tabs.Screen name="homework" options={{ title: "الواجبات", tabBarIcon: tabIcon("clipboard", "clipboard-outline") }} />
        <Tabs.Screen name="schedule" options={{ title: "الجدول", tabBarIcon: tabIcon("calendar", "calendar-outline") }} />
        <Tabs.Screen name="students" options={{ title: "الطلاب", tabBarIcon: tabIcon("people", "people-outline") }} />
        <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: tabIcon("home", "home-outline") }} />
        {/* Reached from "More"; not tabs of their own. */}
        <Tabs.Screen name="groups" options={{ href: null }} />
        <Tabs.Screen name="attendance-log" options={{ href: null }} />
        <Tabs.Screen name="reports" options={{ href: null }} />
        <Tabs.Screen name="notices" options={{ href: null }} />
      </Tabs>
    </>
  );
}

export default function TeacherLayout() {
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
  if (role !== "teacher") return <Redirect href={homeRouteFor(role)} />;

  return (
    <TeacherProvider>
      <TeacherTabs />
    </TeacherProvider>
  );
}
