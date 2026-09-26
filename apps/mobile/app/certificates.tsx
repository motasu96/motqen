import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useAuth } from "../lib/auth";
import {
  amountShort,
  CertificateRow,
  certificateTitle,
  GRADE_LABEL_TEXT,
  listMyCertificates,
} from "../lib/examsCertificates";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

export default function CertificatesScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const userId = session?.user?.id;
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [ready, setReady] = useState(false);
  const [viewing, setViewing] = useState<CertificateRow | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const rows = await listMyCertificates(userId);
      if (cancelled) return;
      setCertificates(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "الشهادات" }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          {certificates.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="ribbon-outline" size={40} color={colors.line} />
              <Text style={styles.empty}>لا توجد شهادات صادرة بعد</Text>
            </View>
          ) : (
            certificates.map((c) => (
              <View key={c.id} style={styles.card}>
                <View style={styles.iconBubble}>
                  <Ionicons name="ribbon" size={20} color={colors.goldDark} />
                </View>
                <Text style={styles.title}>
                  {certificateTitle(c.scope)} — {amountShort(c.scope, c.juz_count)}
                </Text>
                <Text style={styles.meta}>
                  {c.grade_label ? `${GRADE_LABEL_TEXT[c.grade_label] ?? c.grade_label} · ` : ""}
                  {c.grade_percent != null ? `${c.grade_percent}% · ` : ""}
                  مع {c.teacher_name} · {c.issued_at.slice(0, 10)}
                </Text>
                <TouchableOpacity style={styles.viewButton} onPress={() => setViewing(c)}>
                  <Text style={styles.viewButtonText}>عرض الشهادة</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {viewing && (
              <>
                <Ionicons name="ribbon" size={40} color={colors.goldDark} style={{ alignSelf: "center" }} />
                <Text style={styles.modalTitle}>{certificateTitle(viewing.scope)}</Text>
                <Text style={styles.modalRow}>الطالب: تُمنح هذه الشهادة</Text>
                <Text style={styles.modalRow}>لإتمام: {amountShort(viewing.scope, viewing.juz_count)}</Text>
                {viewing.juz_names && <Text style={styles.modalRow}>{viewing.juz_names}</Text>}
                <Text style={styles.modalRow}>برواية: {viewing.narration}</Text>
                {viewing.grade_label && (
                  <Text style={styles.modalRow}>
                    التقدير: {GRADE_LABEL_TEXT[viewing.grade_label] ?? viewing.grade_label}
                    {viewing.grade_percent != null ? ` (${viewing.grade_percent}%)` : ""}
                  </Text>
                )}
                <Text style={styles.modalRow}>المعلم: {viewing.teacher_name}</Text>
                <Text style={styles.modalRow}>رقم الشهادة: {viewing.certificate_number}</Text>
                <Text style={styles.modalRow}>تاريخ الإصدار: {viewing.issued_at.slice(0, 10)}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setViewing(null)}>
                  <Text style={styles.closeButtonText}>إغلاق</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  emptyWrap: { alignItems: "center", marginTop: 60, gap: 10 },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 6, ...shadow.soft },
  iconBubble: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.goldLight, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: "right" },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  viewButton: { alignSelf: "flex-start", borderWidth: 1, borderColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8, marginTop: 4 },
  viewButtonText: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 24, gap: 8, width: "100%", maxWidth: 400 },
  modalTitle: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.goldDark, textAlign: "center", marginBottom: 6 },
  modalRow: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink, textAlign: "center" },
  closeButton: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  closeButtonText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 14 },
  });
}
