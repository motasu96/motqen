import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useAuth } from "../lib/auth";
import { CertificateRow, certificateTitle, GRADE_LABEL_TEXT, listMyCertificates } from "../lib/examsCertificates";
import { certificateAmount } from "../lib/certificateFormat";
import { buildCertificateHtml } from "../lib/certificateHtml";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

export default function CertificatesScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const userId = session?.user?.id;
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [ready, setReady] = useState(false);
  const [viewing, setViewing] = useState<CertificateRow | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
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
    }, [userId])
  );

  async function handleDownload(cert: CertificateRow) {
    setDownloadingId(cert.id);
    try {
      const html = buildCertificateHtml(cert);
      const { uri } = await Print.printToFileAsync({ html, width: 1123, height: 794 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "شهادتك" });
      } else {
        Alert.alert("تم إنشاء الشهادة", "تعذّرت المشاركة المباشرة على هذا الجهاز.");
      }
    } catch {
      Alert.alert("تعذّر تحميل الشهادة", "حاول مرة أخرى، وتأكد من اتصالك بالإنترنت.");
    }
    setDownloadingId(null);
  }

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
                  {certificateTitle(c.scope)} — {certificateAmount(c)}
                </Text>
                <Text style={styles.meta}>
                  {c.grade_label ? `${GRADE_LABEL_TEXT[c.grade_label] ?? c.grade_label} · ` : ""}
                  {c.grade_percent != null ? `${c.grade_percent}% · ` : ""}
                  مع {c.teacher_name} · {c.issued_at.slice(0, 10)}
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.viewButton} onPress={() => setViewing(c)}>
                    <Text style={styles.viewButtonText}>عرض الشهادة</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    disabled={downloadingId === c.id}
                    onPress={() => handleDownload(c)}
                  >
                    {downloadingId === c.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="share-outline" size={14} color="#fff" />
                        <Text style={styles.downloadButtonText}>تحميل ومشاركة</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
                <Text style={styles.modalRow}>تُمنح هذه الشهادة إلى: {viewing.student_name}</Text>
                <Text style={styles.modalRow}>لإتمام: {certificateAmount(viewing)}</Text>
                {viewing.juz_names && <Text style={styles.modalRow}>{viewing.juz_names}</Text>}
                {viewing.scope !== "course" && <Text style={styles.modalRow}>برواية: {viewing.narration}</Text>}
                {viewing.grade_label && (
                  <Text style={styles.modalRow}>
                    التقدير: {GRADE_LABEL_TEXT[viewing.grade_label] ?? viewing.grade_label}
                    {viewing.grade_percent != null ? ` (${viewing.grade_percent}%)` : ""}
                  </Text>
                )}
                <Text style={styles.modalRow}>المعلم: {viewing.teacher_name}</Text>
                <Text style={styles.modalRow}>رقم الشهادة: {viewing.certificate_number}</Text>
                <Text style={styles.modalRow}>تاريخ الإصدار: {viewing.issued_at.slice(0, 10)}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  disabled={downloadingId === viewing.id}
                  onPress={() => handleDownload(viewing)}
                >
                  {downloadingId === viewing.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.closeButtonText}>تحميل الشهادة ومشاركتها</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCloseLink} onPress={() => setViewing(null)}>
                  <Text style={styles.modalCloseLinkText}>إغلاق</Text>
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
  cardActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  viewButton: { alignSelf: "flex-start", borderWidth: 1, borderColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8 },
  viewButtonText: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 100,
    justifyContent: "center",
  },
  downloadButtonText: { fontFamily: fonts.bold, fontSize: 12, color: "#fff" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 24, gap: 8, width: "100%", maxWidth: 400 },
  modalTitle: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.goldDark, textAlign: "center", marginBottom: 6 },
  modalRow: { fontFamily: fonts.regular, fontSize: 13, color: colors.ink, textAlign: "center" },
  closeButton: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  closeButtonText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 14 },
  modalCloseLink: { alignItems: "center", paddingVertical: 8 },
  modalCloseLinkText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  });
}
