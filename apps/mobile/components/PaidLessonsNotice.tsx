import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UpcomingBooking } from "../lib/studentProfile";
import { getTeacherWhatsApps } from "../lib/teachers";
import { ADMIN_WHATSAPP_NUMBER, openWhatsApp } from "../lib/contact";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

function describeCount(count: number) {
  if (count === 1) return "لديك حصة فردية قادمة";
  if (count === 2) return "لديك حصتان فرديتان قادمتان";
  if (count <= 10) return `لديك ${count} حصص فردية قادمة`;
  return `لديك ${count} حصة فردية قادمة`;
}

// Private lessons used to be free. A student who already had private
// bookings before that changed never goes through the booking flow's
// "it's paid, contact us" step again, so this tells them on the home tab
// instead — mirrors components/dashboard/PaidLessonsNotice.tsx on web.
export default function PaidLessonsNotice({
  upcoming,
  studentName,
}: {
  upcoming: UpcomingBooking[];
  studentName: string | null;
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [teacherWhatsApps, setTeacherWhatsApps] = useState<Map<string, string>>(new Map());

  const teachers = useMemo(() => {
    const byId = new Map<string, string>();
    for (const b of upcoming) byId.set(b.teacherId, b.teacherName);
    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [upcoming]);
  const teacherIdsKey = teachers.map((t) => t.id).join(",");

  useEffect(() => {
    if (!teacherIdsKey) return;
    let cancelled = false;
    (async () => {
      const map = await getTeacherWhatsApps(teacherIdsKey.split(","));
      if (!cancelled) setTeacherWhatsApps(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherIdsKey]);

  if (upcoming.length === 0) return null;

  const greeting = studentName ? `السلام عليكم، أنا ${studentName}.` : "السلام عليكم.";
  const bookingsList = upcoming.map((b) => `مع ${b.teacherName} يوم ${b.date} الساعة ${b.time}`).join("؛ ");

  return (
    <View style={styles.card}>
      <Text style={styles.title}>الحصص الفردية أصبحت مدفوعة</Text>
      <Text style={styles.desc}>
        {describeCount(upcoming.length)}. لا يتم أي دفع عبر التطبيق — تواصل عبر واتساب لمعرفة السعر وطرق الدفع، أما الحلقات
        الجماعية فتبقى مجانية بالكامل.
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            openWhatsApp(
              ADMIN_WHATSAPP_NUMBER,
              `${greeting} لدي حصص فردية محجوزة: ${bookingsList}. أرغب بمعرفة السعر وطرق الدفع المتاحة.`
            )
          }
        >
          <Ionicons name="logo-whatsapp" size={16} color="#fff" />
          <Text style={styles.buttonText}>اسأل الإدارة عن السعر</Text>
        </TouchableOpacity>
        {teachers.map((t) => {
          const number = teacherWhatsApps.get(t.id);
          if (!number) return null;
          return (
            <TouchableOpacity
              key={t.id}
              style={styles.button}
              onPress={() =>
                openWhatsApp(number, `${greeting} تواصلت معك عبر منصة متقن، وأرغب بمعرفة سعر الحصص الفردية معك وطرق الدفع.`)
              }
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.buttonText}>تواصل مع {t.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.gold,
      gap: 10,
      ...shadow.soft,
    },
    title: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" },
    desc: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", lineHeight: 20 },
    row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
    button: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#25D366", borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
    buttonText: { color: "#fff", fontFamily: fonts.bold, fontSize: 12 },
  });
}
