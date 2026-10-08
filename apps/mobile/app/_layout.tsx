import "react-native-gesture-handler";
import { useEffect } from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
} from "@expo-google-fonts/tajawal";
import { AuthProvider } from "../lib/auth";
import { ThemeProvider, useTheme } from "../lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Applies the brand typeface to every <Text> in the app without having to
// pass fontFamily on each one individually.
const TextAny = Text as unknown as { defaultProps?: { style?: unknown } };
TextAny.defaultProps = TextAny.defaultProps || {};
TextAny.defaultProps.style = [{ fontFamily: "Tajawal_400Regular" }, TextAny.defaultProps.style];

function ThemedStack() {
  const { colors, isDark, ready } = useTheme();
  if (!ready) return null;
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="room/[room]" options={{ presentation: "fullScreenModal" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ThemedStack />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
