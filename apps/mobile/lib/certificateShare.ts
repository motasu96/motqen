import { Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { buildCertificateHtml } from "./certificateHtml";
import { CertificateRow } from "./examsCertificates";

// Renders a certificate as a PDF and opens the native share sheet. Returns
// false (after telling the user) if it could not be produced.
export async function shareCertificatePdf(cert: CertificateRow, dialogTitle = "الشهادة"): Promise<boolean> {
  try {
    const html = buildCertificateHtml(cert);
    const { uri } = await Print.printToFileAsync({ html, width: 1123, height: 794 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle });
    } else {
      Alert.alert("تم إنشاء الشهادة", "تعذّرت المشاركة المباشرة على هذا الجهاز.");
    }
    return true;
  } catch {
    Alert.alert("تعذّر تحميل الشهادة", "حاول مرة أخرى، وتأكد من اتصالك بالإنترنت.");
    return false;
  }
}
