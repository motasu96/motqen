import { ReactNode, useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fonts, Palette, radius, shadow, useTheme } from "../../lib/theme";

// Small shared kit for the teacher and admin screens, so each screen file
// holds only its own logic and the look stays consistent with the student
// screens (same theme tokens, Tajawal, gold accents).

export function Screen({
  title,
  subtitle,
  children,
  onRefresh,
  right,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  right?: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.gold} /> : undefined
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[getStyles(colors).card, style]}>{children}</View>;
}

export function SectionTitle({ icon, children }: { icon?: keyof typeof Ionicons.glyphMap; children: ReactNode }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.sectionTitleRow}>
      {icon ? <Ionicons name={icon} size={18} color={colors.goldDark} /> : null}
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={getStyles(colors).muted}>{children}</Text>;
}

export function Loading() {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={getStyles(colors).empty}>
      <Text style={getStyles(colors).muted}>{children}</Text>
    </View>
  );
}

export function StatTile({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={18} color={colors.goldDark} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  small,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "danger" | "whatsapp";
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const bg =
    variant === "primary" ? colors.gold : variant === "whatsapp" ? "#25D366" : variant === "danger" ? colors.danger : "transparent";
  const fg = variant === "outline" ? colors.goldDark : "#fff";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, borderColor: variant === "outline" ? colors.gold : bg },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 14 : 16} color={fg} /> : null}
          <Text style={[styles.buttonText, small && { fontSize: 12 }, { color: fg }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && { backgroundColor: colors.gold, borderColor: colors.gold }]}
    >
      <Text style={[styles.chipText, active && { color: "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Pill({ label, tone = "gold" }: { label: string; tone?: "gold" | "green" | "red" | "blue" }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const palette = {
    gold: { bg: colors.goldLight, fg: colors.goldDark },
    green: { bg: "#10B98122", fg: colors.success },
    red: { bg: "#EF444422", fg: colors.danger },
    blue: { bg: "#0EA5E922", fg: "#0284C7" },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.pillText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function Field({
  label,
  hint,
  ...props
}: TextInputProps & {
  label?: string;
  hint?: string;
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.inkSoft}
        textAlign="right"
        {...props}
        style={[styles.input, props.multiline && { minHeight: 76, textAlignVertical: "top" }, props.style]}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.segmented}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.key}
          onPress={() => onChange(o.key)}
          activeOpacity={0.8}
          style={[styles.segment, value === o.key && { backgroundColor: colors.gold }]}
        >
          <Text style={[styles.segmentText, value === o.key && { color: "#fff" }]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Row({
  title,
  subtitle,
  trailing,
  onPress,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const body = (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {body}
    </TouchableOpacity>
  ) : (
    body
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 18, gap: 16, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    title: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.ink, textAlign: "right" },
    subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.line,
      gap: 12,
      ...shadow.soft,
    },
    sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    sectionTitle: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" },
    muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", lineHeight: 19 },
    empty: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.line, borderRadius: radius.md, padding: 16 },
    stat: {
      flexBasis: "47%",
      flexGrow: 1,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.line,
      gap: 6,
      ...shadow.soft,
    },
    statIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center" },
    statValue: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.ink, textAlign: "right" },
    statLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right" },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: radius.pill,
      borderWidth: 1,
      paddingHorizontal: 18,
      paddingVertical: 11,
    },
    buttonSmall: { paddingHorizontal: 12, paddingVertical: 7 },
    buttonText: { fontFamily: fonts.bold, fontSize: 13 },
    chip: {
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.bg,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipText: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkSoft },
    pill: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
    pillText: { fontFamily: fonts.bold, fontSize: 11 },
    fieldLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: "right" },
    fieldHint: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right" },
    input: {
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.ink,
    },
    segmented: {
      flexDirection: "row",
      gap: 6,
      backgroundColor: colors.bg,
      borderRadius: radius.pill,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.line,
    },
    segment: { flex: 1, borderRadius: radius.pill, paddingVertical: 9, alignItems: "center" },
    segmentText: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkSoft },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.bg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      padding: 12,
    },
    rowTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink, textAlign: "right" },
    rowSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  });
}
