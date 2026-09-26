export const colors = {
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

export const gradients = {
  gold: [colors.gold, colors.goldDark] as const,
};

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
