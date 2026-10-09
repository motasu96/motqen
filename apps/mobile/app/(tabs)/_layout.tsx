import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { homeRouteFor, useAuth } from "../../lib/auth";
import { fonts, useTheme } from "../../lib/theme";

export default function TabsLayout() {
  const { session, role, loading } = useAuth();
  const { colors } = useTheme();

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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: 62, paddingTop: 6, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "حسابي",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "حلقاتي",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "البرامج",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
