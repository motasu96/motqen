import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { fonts, radius } from "../lib/theme";

// Mirrors components/dashboard/PulseBadge.tsx on the web app: a pill with a
// pulsing dot, used for "teacher available now" / "live now" indicators.
export default function PulseBadge({ color, label }: { color: "emerald" | "red"; label: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 2.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      scale.setValue(1);
      opacity.setValue(0.75);
    };
  }, [scale, opacity]);

  const dotColor = color === "emerald" ? "#10B981" : "#EF4444";
  const bg = color === "emerald" ? "#ECFDF5" : "#FEF2F2";
  const text = color === "emerald" ? "#059669" : "#EF4444";

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <View style={styles.dotWrap}>
        <Animated.View style={[styles.ping, { backgroundColor: dotColor, opacity, transform: [{ scale }] }]} />
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dotWrap: { width: 8, height: 8, alignItems: "center", justifyContent: "center" },
  ping: { position: "absolute", width: 8, height: 8, borderRadius: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontFamily: fonts.bold, fontSize: 11 },
});
