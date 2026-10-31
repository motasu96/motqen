import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, ColorValue, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { homeRouteFor, useAuth } from "../../lib/auth";
import { fonts, useTheme } from "../../lib/theme";

function TabIcon({ name, color, size, focused }: {
  name: keyof typeof Ionicons.glyphMap; color: ColorValue; size: number; focused: boolean;
}) {
  const { colors } = useTheme();
  return <View style={{ minWidth: 48, minHeight: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: focused ? colors.primaryLight : "transparent" }}>
    <Ionicons name={name} color={color} size={size} />
  </View>;
}

export default function TabsLayout() {
  const { session, role, loading } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  // Teachers/admins that land on the student tabs (stale deep link, back
  // navigation) belong in their own interface.
  if (role === "teacher" || role === "admin") {
    return <Redirect href={homeRouteFor(role)} />;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: { minHeight: 48 },
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: 64 + Math.max(insets.bottom, 8), paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8) },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "حسابي",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} name={focused ? "person" : "person-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "حلقاتي",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} name={focused ? "people" : "people-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "البرامج",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} name={focused ? "book" : "book-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
