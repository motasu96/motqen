import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Palette = {
  bg: string;
  card: string;
  gold: string;
  goldDark: string;
  goldLight: string;
  ink: string;
  inkSoft: string;
  line: string;
  danger: string;
  success: string;
};

export const lightPalette: Palette = {
  bg: "#FBF7EE",
  card: "#FFFFFF",
  gold: "#C89B4A",
  goldDark: "#A87A37",
  goldLight: "#F1E3C4",
  ink: "#2E2418",
  inkSoft: "#7F7567",
  line: "#EDE3CD",
  danger: "#EF4444",
  success: "#10B981",
};

// Mirrors the web app's .dark CSS variable overrides in app/globals.css.
export const darkPalette: Palette = {
  bg: "#16120E",
  card: "#221C15",
  gold: "#D2A558",
  goldDark: "#E7C280",
  goldLight: "#3A2F1E",
  ink: "#F0EADE",
  inkSoft: "#A89D8C",
  line: "#382F23",
  danger: "#EF4444",
  success: "#10B981",
};

export function gradientFor(colors: Palette) {
  return [colors.gold, colors.goldDark] as const;
}

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const shadow = {
  card: {
    shadowColor: "#2E2418",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  soft: {
    shadowColor: "#2E2418",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
};

export const fonts = {
  regular: "Tajawal_400Regular",
  medium: "Tajawal_500Medium",
  bold: "Tajawal_700Bold",
  extraBold: "Tajawal_800ExtraBold",
};

type ThemeContextValue = { colors: Palette; isDark: boolean; ready: boolean; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightPalette,
  isDark: false,
  ready: false,
  toggle: () => {},
});

const STORAGE_KEY = "motqen_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === "dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") setIsDark(saved === "dark");
      } catch {}
      setReady(true);
    })();
  }, []);

  function toggle() {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? "dark" : "light").catch(() => {});
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ colors: isDark ? darkPalette : lightPalette, isDark, ready, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
