import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "../lib/theme";

export default function BrandLogo({ width = 160 }: { width?: number }) {
  const { isDark } = useTheme();
  return (
    <View style={[styles.frame, isDark && styles.lightSurface]}>
      <Image source={require("../assets/brand-logo.png")} accessibilityLabel="متقن — مقرأة القرآن الكريم" resizeMode="contain" style={{ width, height: width * (671 / 1800) }} />
    </View>
  );
}
const styles = StyleSheet.create({
  frame: { alignItems: "center", justifyContent: "center", padding: 8, borderRadius: 16 },
  // The original logo includes a dark subtitle; preserve its legibility.
  lightSurface: { backgroundColor: "#FBF7EE" },
});
