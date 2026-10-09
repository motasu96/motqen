import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { homeRouteFor, useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";

export default function Index() {
  const { session, role, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  // An account whose role couldn't be read falls back to the student home,
  // which already handles a missing student record gracefully.
  return <Redirect href={session ? homeRouteFor(role) : "/login"} />;
}
