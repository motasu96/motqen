import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../lib/auth";
import { cancelBooking, getMyStudentProfile, listUpcomingBookings, UpcomingBooking } from "../lib/studentProfile";
import { createBooking, getTakenSlots } from "../lib/bookings";
import { getTeacherAvailableTimes, getTeacherWhatsApp } from "../lib/teachers";
import { ADMIN_WHATSAPP_NUMBER, openWhatsApp } from "../lib/contact";
import { DEFAULT_AVAILABLE_TIMES, formatTimeSlot } from "../lib/timeSlots";
import { useLiveRooms } from "../lib/presence";
import PulseBadge from "./PulseBadge";
import { fonts, Palette, radius, shadow, useTheme } from "../lib/theme";

const HOLD_DURATION_MS = 10 * 60 * 1000;
const DAY_LABELS = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function buildNextDays(count: number) {
  const days: { iso: string; label: string; dayNum: number }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ iso: d.toISOString().slice(0, 10), label: DAY_LABELS[d.getDay()], dayNum: d.getDate() });
  }
  return days;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type BookingType = "trial" | "group";
type PendingSlot = { day: string; hhmm: string; time: string; expiresAt: number };

const WHATSAPP_GREEN = "#25D366";

export default function BookingCalendar({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const studentId = session?.user?.id;

  const days = useMemo(() => buildNextDays(7), []);
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [bookingType, setBookingType] = useState<BookingType>("trial");
  const [selectedDay, setSelectedDay] = useState(days[0].iso);
  const [availableTimes, setAvailableTimes] = useState<string[]>(DEFAULT_AVAILABLE_TIMES);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [slotsReady, setSlotsReady] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [teacherWhatsApp, setTeacherWhatsApp] = useState<string | null>(null);
  const [lastBooked, setLastBooked] = useState<{ day: string; time: string } | null>(null);
  const [pendingSlot, setPendingSlot] = useState<PendingSlot | null>(null);
  const [confirmedFlash, setConfirmedFlash] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [upcomingReady, setUpcomingReady] = useState(false);
  const liveRooms = useLiveRooms();

  const TIME_SLOTS = useMemo(() => availableTimes.map((hhmm) => ({ hhmm, label: formatTimeSlot(hhmm) })), [availableTimes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const times = await getTeacherAvailableTimes(teacherId);
      if (cancelled || times.length === 0) return;
      setAvailableTimes(times);
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      const [taken, { fullName }, whatsapp] = await Promise.all([
        getTakenSlots(teacherId, days[0].iso, days[days.length - 1].iso),
        getMyStudentProfile(studentId),
        getTeacherWhatsApp(teacherId),
      ]);
      if (cancelled) return;
      setTakenSlots(taken);
      setTeacherWhatsApp(whatsapp);
      setStudentName(fullName);
      setSlotsReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, studentId]);

  const loadUpcoming = useCallback(async () => {
    if (!studentId) return;
    const rows = await listUpcomingBookings(studentId);
    setUpcoming(rows);
    setUpcomingReady(true);
  }, [studentId]);

  useFocusEffect(
    useCallback(() => {
      loadUpcoming();
    }, [loadUpcoming])
  );

  useEffect(() => {
    if (!pendingSlot) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [pendingSlot]);

  // Keeps "now" fresh even without an active hold, so a today's slot that
  // just passed greys itself out without needing to leave and re-enter.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pendingSlot && now >= pendingSlot.expiresAt) {
      setPendingSlot(null);
      Alert.alert("انتهت مهلة الحجز", "انتهت مهلة حجز هذا الموعد، اختر موعدًا من جديد.");
    }
  }, [now, pendingSlot]);

  function isSlotTaken(day: string, time: string) {
    return takenSlots.has(`${day}__${time}`);
  }

  // A slot for today whose time has already passed can't be booked.
  function isSlotPast(day: string, hhmm: string) {
    if (day !== todayIso) return false;
    const [h, m] = hhmm.split(":").map(Number);
    const nowDate = new Date(now);
    return h * 60 + m <= nowDate.getHours() * 60 + nowDate.getMinutes();
  }

  function handleSelectSlot(hhmm: string, time: string) {
    if (isSlotTaken(selectedDay, time)) {
      Alert.alert("هذا الموعد محجوز", "الرجاء اختيار موعد آخر.");
      return;
    }
    if (isSlotPast(selectedDay, hhmm)) {
      Alert.alert("انتهى هذا الموعد", "الرجاء اختيار موعد لاحق.");
      return;
    }
    setPendingSlot({ day: selectedDay, hhmm, time, expiresAt: Date.now() + HOLD_DURATION_MS });
  }

  async function handleConfirmHold() {
    if (!pendingSlot || !studentId) return;
    if (isSlotPast(pendingSlot.day, pendingSlot.hhmm)) {
      setPendingSlot(null);
      Alert.alert("انتهى هذا الموعد", "الرجاء اختيار موعد لاحق.");
      return;
    }
    setSubmitting(true);
    const { booking, error } = await createBooking({
      studentId,
      teacherId,
      date: pendingSlot.day,
      time: pendingSlot.time,
    });
    setSubmitting(false);
    if (error === "slot_taken") {
      setTakenSlots((prev) => new Set(prev).add(`${pendingSlot.day}__${pendingSlot.time}`));
      Alert.alert("هذا الموعد محجوز", "حجز أحدهم هذا الموعد للتو، اختر موعدًا آخر.");
      setPendingSlot(null);
      return;
    }
    if (error || !booking) {
      Alert.alert("تعذّر الحجز", "حاول مرة أخرى.");
      return;
    }
    setTakenSlots((prev) => new Set(prev).add(`${pendingSlot.day}__${pendingSlot.time}`));
    // The booking itself is what makes the teacher's shared number readable (RLS).
    const [, whatsapp] = await Promise.all([loadUpcoming(), getTeacherWhatsApp(teacherId)]);
    setTeacherWhatsApp(whatsapp);
    setLastBooked({ day: pendingSlot.day, time: pendingSlot.time });
    setConfirmedFlash(pendingSlot.time);
    setPendingSlot(null);
    setTimeout(() => setConfirmedFlash(null), 1800);
  }

  function handleCancelHold() {
    setPendingSlot(null);
  }

  const greeting = studentName ? `السلام عليكم، أنا ${studentName}.` : "السلام عليكم.";

  function contactAdminForPricing() {
    openWhatsApp(ADMIN_WHATSAPP_NUMBER, `السلام عليكم، أرغب بمعرفة سعر الحصص الفردية مع ${teacherName} وطرق الدفع المتاحة.`);
  }

  function contactAdminAboutBooking(day: string, time: string) {
    openWhatsApp(
      ADMIN_WHATSAPP_NUMBER,
      `${greeting} حجزت حصة فردية مع ${teacherName} يوم ${day} الساعة ${time}، وأرغب بمعرفة السعر وطرق الدفع المتاحة.`
    );
  }

  function contactTeacherForPricing() {
    if (!teacherWhatsApp) return;
    openWhatsApp(teacherWhatsApp, `${greeting} تواصلت معك عبر منصة متقن، وأرغب بمعرفة سعر الحصص الفردية معك وطرق الدفع.`);
  }

  function handleCancelBooking(id: string) {
    const removed = upcoming.find((b) => b.id === id);
    Alert.alert("إلغاء الحصة", "هل أنت متأكد من إلغاء هذه الحصة المحجوزة؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "إلغاء الحصة",
        style: "destructive",
        onPress: async () => {
          const ok = await cancelBooking(id);
          if (!ok) return;
          setUpcoming((prev) => prev.filter((b) => b.id !== id));
          if (removed) {
            setTakenSlots((prev) => {
              const next = new Set(prev);
              next.delete(`${removed.date}__${removed.time}`);
              return next;
            });
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.card}>
      <View>
        <View style={styles.headerRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.goldDark} />
          <Text style={styles.cardTitle}>حجز حصة جديدة</Text>
        </View>
        <Text style={styles.cardDesc}>مع {teacherName}</Text>
      </View>

      <View style={styles.typeToggle}>
        {(
          [
            { key: "trial" as const, label: "حصة فردية" },
            { key: "group" as const, label: "حلقة جماعية" },
          ]
        ).map((bt) => (
          <TouchableOpacity
            key={bt.key}
            onPress={() => setBookingType(bt.key)}
            style={[styles.typeButton, bookingType === bt.key && styles.typeButtonActive]}
          >
            <Text style={[styles.typeButtonText, bookingType === bt.key && styles.typeButtonTextActive]}>{bt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {bookingType === "group" ? (
        <View style={styles.groupBox}>
          <Ionicons name="people" size={22} color={colors.goldDark} />
          <Text style={styles.groupTitle}>حلقات هذا المعلم الجماعية</Text>
          <Text style={styles.cardDesc}>تصفّح الحلقات الجماعية المتاحة مع هذا المعلم وانضم إليها.</Text>
          <TouchableOpacity
            style={styles.groupCta}
            onPress={() => router.push({ pathname: "/(tabs)/groups", params: { teacherId } })}
          >
            <Text style={styles.groupCtaText}>عرض الحلقات</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.paidBox}>
            <Text style={styles.paidTitle}>الحصص الفردية مدفوعة</Text>
            <Text style={styles.note}>
              لا يتم أي دفع عبر التطبيق. احجز موعدك ثم تواصل مع الإدارة عبر واتساب لمعرفة السعر وطرق الدفع.
            </Text>
            <View style={styles.whatsappRow}>
              <TouchableOpacity style={styles.whatsappButton} onPress={contactAdminForPricing}>
                <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                <Text style={styles.whatsappButtonText}>اسأل الإدارة عن السعر</Text>
              </TouchableOpacity>
              {teacherWhatsApp ? (
                <TouchableOpacity style={styles.whatsappButton} onPress={contactTeacherForPricing}>
                  <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                  <Text style={styles.whatsappButtonText}>تواصل مع {teacherName}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <Text style={styles.note}>اختر يومًا ثم وقتًا متاحًا لدى المعلم، وسيُحجز لك المكان لمدة 10 دقائق لتأكيد الحجز.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
            {days.map((d) => (
              <TouchableOpacity
                key={d.iso}
                onPress={() => setSelectedDay(d.iso)}
                style={[styles.dayPill, selectedDay === d.iso && styles.dayPillActive]}
              >
                <Text style={[styles.dayLabel, selectedDay === d.iso && styles.dayLabelActive]}>{d.label}</Text>
                <Text style={[styles.dayNum, selectedDay === d.iso && styles.dayLabelActive]}>{d.dayNum}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map(({ hhmm, label: time }) => {
              const taken = slotsReady && isSlotTaken(selectedDay, time);
              const past = isSlotPast(selectedDay, hhmm);
              const disabled = taken || past;
              const justConfirmed = confirmedFlash === time;
              const isPending = pendingSlot?.day === selectedDay && pendingSlot?.time === time;
              return (
                <TouchableOpacity
                  key={hhmm}
                  disabled={disabled}
                  onPress={() => handleSelectSlot(hhmm, time)}
                  style={[
                    styles.slot,
                    disabled && styles.slotDisabled,
                    justConfirmed && styles.slotConfirmed,
                    isPending && styles.slotPending,
                  ]}
                >
                  <Ionicons name="time-outline" size={14} color={disabled ? colors.inkSoft : justConfirmed ? "#fff" : colors.ink} />
                  <Text
                    style={[
                      styles.slotText,
                      disabled && styles.slotTextDisabled,
                      justConfirmed && styles.slotTextConfirmed,
                      isPending && styles.slotTextPending,
                    ]}
                  >
                    {time}
                  </Text>
                  {taken && <Text style={styles.slotSubText}>محجوز</Text>}
                  {!taken && past && <Text style={styles.slotSubText}>انتهى</Text>}
                  {justConfirmed && <Text style={styles.slotSubTextConfirmed}>تم الحجز</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {pendingSlot && (
            <View style={styles.holdBox}>
              <View style={styles.holdHeaderRow}>
                <View>
                  <Text style={styles.holdTitle}>تأكيد الحجز المؤقت</Text>
                  <Text style={styles.holdSubtitle}>
                    {pendingSlot.day} — {pendingSlot.time}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.holdTimerLabel}>ينتهي خلال</Text>
                  <Text style={styles.holdTimer}>{formatCountdown(pendingSlot.expiresAt - now)}</Text>
                </View>
              </View>
              <View style={styles.holdActionsRow}>
                <TouchableOpacity style={styles.confirmButton} disabled={submitting} onPress={handleConfirmHold}>
                  {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.confirmButtonText}>تأكيد الحجز</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelHold}>
                  <Text style={styles.holdCancelText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {lastBooked && (
            <View style={styles.holdBox}>
              <View>
                <Text style={styles.holdTitle}>
                  تم حجز موعدك: {lastBooked.day} — {lastBooked.time}
                </Text>
                <Text style={styles.cardDesc}>الخطوة التالية: تواصل عبر واتساب لمعرفة سعر الحصة وطرق الدفع المتاحة.</Text>
              </View>
              <View style={styles.whatsappRow}>
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => contactAdminAboutBooking(lastBooked.day, lastBooked.time)}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                  <Text style={styles.whatsappButtonText}>اسأل الإدارة عن السعر</Text>
                </TouchableOpacity>
                {teacherWhatsApp ? (
                  <TouchableOpacity style={styles.whatsappButton} onPress={contactTeacherForPricing}>
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text style={styles.whatsappButtonText}>تواصل مع {teacherName}</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={() => setLastBooked(null)}>
                  <Text style={styles.holdCancelText}>إغلاق</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}

      <View style={styles.upcomingSection}>
        <Text style={styles.upcomingTitle}>حصصك القادمة</Text>
        {!upcomingReady ? null : upcoming.length === 0 ? (
          <Text style={styles.cardDesc}>لا توجد حصص فردية محجوزة قريبًا</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {upcoming.map((b) => (
              <View key={b.id} style={styles.upcomingRow}>
                <View style={styles.rowText}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.upcomingDate}>
                      {b.date} — {b.time}
                    </Text>
                    {liveRooms.get(b.id)?.teacherPresent && <PulseBadge color="red" label="مباشر الآن" />}
                  </View>
                  <Text style={styles.cardDesc}>مع {b.teacherName}</Text>
                </View>
                <TouchableOpacity style={styles.smallJoinButton} onPress={() => router.push(`/room/${b.id}`)}>
                  <Text style={styles.smallJoinButtonText}>دخول</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCancelBooking(b.id)}>
                  <Text style={styles.cancelText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
      borderColor: colors.line,
      gap: 16,
      ...shadow.soft,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-start" },
    cardTitle: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, textAlign: "right" },
    cardDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
    note: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft, textAlign: "right" },
    typeToggle: { flexDirection: "row", gap: 6, backgroundColor: colors.bg, borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: colors.line },
    typeButton: { flex: 1, borderRadius: radius.pill, paddingVertical: 10, alignItems: "center" },
    typeButtonActive: { backgroundColor: colors.gold },
    typeButtonText: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkSoft },
    typeButtonTextActive: { color: "#fff" },
    paidBox: { gap: 8, backgroundColor: colors.bg, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.line },
    paidTitle: { fontFamily: fonts.extraBold, fontSize: 13, color: colors.ink, textAlign: "right" },
    whatsappRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
    whatsappButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: WHATSAPP_GREEN, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
    whatsappButtonText: { color: "#fff", fontFamily: fonts.bold, fontSize: 12 },
    groupBox: { alignItems: "flex-start", gap: 6, backgroundColor: colors.bg, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line },
    groupTitle: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink, textAlign: "right" },
    groupCta: { marginTop: 8, borderWidth: 1, borderColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 10 },
    groupCtaText: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark },
    daysRow: { gap: 8, paddingVertical: 2 },
    dayPill: { alignItems: "center", gap: 2, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
    dayPillActive: { borderColor: colors.gold, backgroundColor: colors.goldLight },
    dayLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft },
    dayNum: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.ink },
    dayLabelActive: { color: colors.goldDark },
    slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    slot: { flexBasis: "23%", flexGrow: 1, alignItems: "center", gap: 2, borderRadius: radius.md, paddingVertical: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
    slotDisabled: { opacity: 0.5 },
    slotConfirmed: { borderColor: colors.gold, backgroundColor: colors.gold },
    slotPending: { borderColor: colors.gold, backgroundColor: colors.goldLight },
    slotText: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink },
    slotTextDisabled: { color: colors.inkSoft },
    slotTextConfirmed: { color: "#fff" },
    slotTextPending: { color: colors.goldDark },
    slotSubText: { fontFamily: fonts.regular, fontSize: 9, color: colors.inkSoft },
    slotSubTextConfirmed: { fontFamily: fonts.regular, fontSize: 9, color: "#fff" },
    holdBox: { gap: 12, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.goldLight },
    holdHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    holdTitle: { fontFamily: fonts.extraBold, fontSize: 13, color: colors.ink, textAlign: "right" },
    holdSubtitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink, marginTop: 2 },
    holdTimerLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.inkSoft },
    holdTimer: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.goldDark },
    holdActionsRow: { flexDirection: "row", alignItems: "center", gap: 16 },
    confirmButton: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: 20, paddingVertical: 10, minWidth: 110, alignItems: "center" },
    confirmButtonText: { color: "#fff", fontFamily: fonts.extraBold, fontSize: 13 },
    holdCancelText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
    upcomingSection: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14, gap: 10 },
    upcomingTitle: { fontFamily: fonts.extraBold, fontSize: 13, color: colors.ink, textAlign: "right" },
    upcomingRow: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 },
    rowText: { flex: 1 },
    upcomingDate: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink },
    smallJoinButton: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
    smallJoinButtonText: { color: "#fff", fontFamily: fonts.bold, fontSize: 11 },
    cancelText: { fontFamily: fonts.bold, fontSize: 11, color: colors.danger },
  });
}
