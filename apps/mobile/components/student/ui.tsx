import { ComponentProps, ReactNode } from "react";
import { I18nManager, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, Palette, radius, useTheme } from "../../lib/theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];
// Place the first child at the Arabic reading edge in either device locale.
export const arabicRow = I18nManager.isRTL ? "row" : "row-reverse";
export const backIcon = I18nManager.isRTL ? "chevron-forward" : "chevron-back";

export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} activeOpacity={0.7}
      style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <Ionicons name={icon} size={21} color={colors.ink} />
    </TouchableOpacity>
  );
}

export function SectionHeading({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.ink }]}>{title}</Text>
      {action && onPress ? (
        <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.textButton} activeOpacity={0.7}>
          <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
          <Ionicons name={backIcon} size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyCard({ icon, title, description, action, onPress }: {
  icon: IconName; title: string; description: string; action?: string; onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.ink }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.inkSoft }]}>{description}</Text>
      {action && onPress ? <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.textButton}>
        <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
        <Ionicons name={backIcon} size={15} color={colors.primary} />
      </TouchableOpacity> : null}
    </View>
  );
}

export function Surface({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.surface, { backgroundColor: colors.card, borderColor: colors.line }]}>{children}</View>;
}

export function HomeSkeleton() {
  const { colors } = useTheme();
  const bar = (width: "100%" | "65%" | "40%", height = 14) => (
    <View style={{ width, height, backgroundColor: colors.line, borderRadius: 8, alignSelf: "flex-end" }} />
  );
  return <View accessible accessibilityRole="progressbar" accessibilityLabel="جارٍ تحميل لوحة الطالب" style={{ gap: 16 }}>
    {[0, 1].map((i) => <View key={i} style={[styles.surface, { backgroundColor: colors.card, borderColor: colors.line, gap: 18 }]}>
      {bar("40%")} {bar("65%", 22)} {bar("100%")} {bar("100%", 44)}
    </View>)}
  </View>;
}

export function studentText(colors: Palette) {
  return {
    title: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 25, textAlign: "right" as const, color: colors.ink },
    body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, textAlign: "right" as const, color: colors.inkSoft },
    caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 20, textAlign: "right" as const, color: colors.inkSoft },
  };
}

const styles = StyleSheet.create({
  iconButton: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sectionRow: { flexDirection: arabicRow, alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 18, lineHeight: 28, textAlign: "right", flexShrink: 1 },
  textButton: { minHeight: 44, paddingHorizontal: 4, flexDirection: arabicRow, gap: 4, alignItems: "center", justifyContent: "center" },
  action: { fontFamily: fonts.bold, fontSize: 13, textAlign: "right" },
  surface: { borderRadius: radius.xl, padding: 20, borderWidth: 1, gap: 12 },
  empty: { borderWidth: 1, borderRadius: radius.xl, padding: 24, alignItems: "center", gap: 10 },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 16, textAlign: "center", lineHeight: 26 },
  emptyDescription: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, textAlign: "center" },
});
