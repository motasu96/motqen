import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import type { UpcomingBooking } from "../../lib/studentProfile";
import type { HomeworkRow } from "../../lib/homework";
import type { LessonWithTeacher } from "../../lib/lessons";
import { fonts, Palette, useTheme } from "../../lib/theme";
import { arabicRow, backIcon, EmptyCard, HomeSkeleton, IconButton, SectionHeading, studentText, Surface } from "./ui";

export type HomePlan = { week: number | null; totalWeeks: number; percent: number; from?: string; to?: string };
export type HomeDashboardProps = {
  name: string;
  program?: string;
  dateLabel: string;
  ready: boolean;
  error: boolean;
  retry: () => void;
  bookings: UpcomingBooking[];
  formatDate: (date: string) => string;
  plan: HomePlan | null;
  teacher: { id: string; name: string; online: boolean } | null;
  liveBookingIds: Set<string>;
  homework: HomeworkRow[];
  latestLesson: LessonWithTeacher | null;
  cancellingId: string | null;
  onCancel: (id: string) => void;
  navigate: (href: Href) => void;
};

const QUICK_LINKS = [
  { href: "/teachers", title: "احجز حصة", subtitle: "اختر معلمك", icon: "calendar-outline" },
  { href: "/homework", title: "واجباتي", subtitle: "حفظ ومراجعة", icon: "document-text-outline" },
  { href: "/(tabs)/groups", title: "حلقاتي", subtitle: "نتعلم معًا", icon: "people-outline" },
  { href: "/reports", title: "تقدّمي", subtitle: "تابع رحلتك", icon: "stats-chart-outline" },
] as const;
const MORE_LINKS = [
  { href: "/lessons", title: "سجل الحصص", icon: "time-outline" },
  { href: "/exams", title: "الاختبارات", icon: "clipboard-outline" },
  { href: "/certificates", title: "شهاداتي", icon: "ribbon-outline" },
  { href: "/archive", title: "الأرشيف", icon: "folder-open-outline" },
] as const;

export default function HomeDashboard(props: HomeDashboardProps) {
  const { colors } = useTheme();
  const s = getStyles(colors);
  const text = studentText(colors);
  const [showAll, setShowAll] = useState(false);
  const next = props.bookings[0];
  const live = next && props.liveBookingIds.has(next.id);
  const rest = props.bookings.slice(1);
  const visibleBookings = showAll ? rest : rest.slice(0, 2);

  return (
    <>
      <View style={s.header}>
        <View style={s.brand}>
          <View style={s.brandMark}><Ionicons name="book-outline" size={24} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.brandTitle}>متقن</Text>
            <Text style={text.caption}>{props.dateLabel}</Text>
          </View>
        </View>
        <IconButton icon="notifications-outline" label="عرض الإعلانات والإشعارات" onPress={() => props.navigate("/notices")} />
      </View>
      <View style={{ gap: 3 }}>
        <Text style={text.body}>السلام عليكم، {props.name}</Text>
        <Text accessibilityRole="header" style={s.greeting}>كل يوم، أقرب إلى الإتقان.</Text>
        {props.program ? <Text style={text.caption}>{props.program}</Text> : null}
      </View>

      {props.error ? <View accessibilityRole="alert" style={s.error}>
        <Ionicons name="cloud-offline-outline" size={23} color={colors.danger} />
        <Text style={[text.body, { flex: 1 }]}>تعذّر تحديث بياناتك. تحقق من الاتصال وحاول مجددًا.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={props.retry} style={s.retry}>
          <Text style={[text.caption, { color: colors.primary, fontFamily: fonts.bold }]}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View> : null}

      {!props.ready ? (props.error ? null : <HomeSkeleton />) : <>
        <LinearGradient colors={[colors.hero, colors.heroEnd]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={s.hero}>
          <View pointerEvents="none" style={s.heroCircle} />
          <View style={s.heroTop}>
            <View style={s.heroPill}>
              <Ionicons name={next ? "videocam-outline" : "sparkles-outline"} color="#F0D49A" size={16} />
              <Text style={s.heroCaption}>{next ? "حصتك القادمة" : "رحلتك مع القرآن"}</Text>
            </View>
            {live ? <View style={s.live}><View style={s.liveDot} /><Text style={s.liveText}>المعلم في الغرفة</Text></View> : null}
          </View>
          <Text style={s.heroTitle}>{next ? `مع ${next.teacherName || "معلمك"}` : "بداية طيبة، وخطوة مباركة"}</Text>
          <Text style={s.heroBody}>{next ? `${props.formatDate(next.date)}  ·  ${next.time}` : "اختر معلمك واحجز أول حصة في وقت يناسبك."}</Text>
          <TouchableOpacity accessibilityRole="button" activeOpacity={0.85} style={s.heroButton}
            onPress={() => props.navigate(next ? `/room/${next.id}` : "/teachers")}>
            <Ionicons name={next ? "videocam-outline" : "calendar-outline"} color="#163E33" size={19} />
            <Text style={s.heroButtonText}>{next ? "الدخول إلى الحصة" : "اختيار معلم وحجز حصة"}</Text>
            <Ionicons name={backIcon} color="#163E33" size={17} />
          </TouchableOpacity>
          {next ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="إلغاء الحصة القادمة" disabled={props.cancellingId === next.id}
            onPress={() => props.onCancel(next.id)} style={s.heroCancel}>
            {props.cancellingId === next.id ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.heroCancelText}>إلغاء الحجز</Text>}
          </TouchableOpacity> : null}
        </LinearGradient>
      </>}

      <View style={s.quickGrid}>
        {QUICK_LINKS.map((item) => <TouchableOpacity key={item.href} accessibilityRole="button" activeOpacity={0.7}
          onPress={() => props.navigate(item.href)} style={s.quickItem}>
          <View style={s.quickIcon}><Ionicons name={item.icon} size={23} color={colors.primary} /></View>
          <Text style={s.quickTitle}>{item.title}</Text>
          <Text style={s.quickSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>)}
      </View>

      {props.ready ? <>
        <SectionHeading title="ورد هذا الأسبوع" action={props.plan ? "تفاصيل الخطة" : undefined} onPress={() => props.navigate("/reports")} />
        {props.plan ? <Surface>
          <View style={s.between}>
            <View style={s.labelRow}><Ionicons name="book-outline" size={20} color={colors.primary} /><Text style={text.title}>خطة الحفظ</Text></View>
            <View style={s.badge}><Text style={s.badgeText}>{props.plan.week ? `الأسبوع ${props.plan.week} / ${props.plan.totalWeeks}` : "انتهت مدة الخطة"}</Text></View>
          </View>
          {props.plan.from && props.plan.to ? <View style={s.portion}>
            <Text style={s.portionLabel}>من</Text><Text style={s.portionText}>{props.plan.from}</Text>
            <View style={s.portionDivider} />
            <Text style={s.portionLabel}>إلى</Text><Text style={s.portionText}>{props.plan.to}</Text>
          </View> : <Text style={text.body}>{props.plan.week ? "راجع معلمك لتحديد مقدار هذا الأسبوع." : "راجع معلمك لتقييم ما أنجزته وتحديد الخطوة القادمة."}</Text>}
          <View style={s.between}><Text style={text.caption}>المسار الزمني للخطة</Text><Text style={s.percent}>{props.plan.percent}%</Text></View>
          <View accessibilityRole="progressbar" accessibilityLabel="المسار الزمني للخطة" accessibilityValue={{ min: 0, max: 100, now: props.plan.percent }} style={s.track}>
            <View style={[s.fill, { width: `${props.plan.percent}%` }]} />
          </View>
          <Text style={text.caption}>تقدير حسب مدة الخطة؛ إتقان الحفظ يؤكّده معلمك.</Text>
        </Surface> : <EmptyCard icon="book-outline" title="لكل رحلة خطة" description="لم تُحدَّد خطة حفظ لك بعد. تواصل مع معلمك لاختيار مقدار يناسبك." action="عرض المعلمين" onPress={() => props.navigate("/teachers")} />}

        {props.teacher ? <TouchableOpacity accessibilityRole="button" activeOpacity={0.75} style={s.teacher}
          onPress={() => props.navigate(`/room/teacher-${props.teacher!.id}`)}>
          <View style={s.teacherAvatar}><Ionicons name="person-outline" size={23} color={colors.primary} /></View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={text.title}>{props.teacher.name}</Text>
            <Text style={text.caption}>{props.teacher.online ? "متاح الآن · ادخل إلى غرفة المعلم" : "غرفة معلمك · الدخول بموافقته"}</Text>
          </View>
          <Ionicons name={backIcon} size={18} color={colors.primary} />
        </TouchableOpacity> : null}

        {rest.length ? <>
          <SectionHeading title="مواعيد أخرى" action={rest.length > 2 ? (showAll ? "عرض أقل" : `عرض الكل (${rest.length})`) : undefined} onPress={() => setShowAll(!showAll)} />
          <Surface>{visibleBookings.map((b) => <View key={b.id} style={s.booking}>
            <View style={{ flex: 1 }}><Text style={text.title}>{props.formatDate(b.date)} · {b.time}</Text><Text style={text.body}>مع {b.teacherName}</Text>
              {props.liveBookingIds.has(b.id) ? <Text style={s.badgeText}>المعلم في الغرفة الآن</Text> : null}
            </View>
            <View style={{ gap: 4 }}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`دخول الحصة مع ${b.teacherName}`} style={s.join} onPress={() => props.navigate(`/room/${b.id}`)}><Text style={s.joinText}>دخول</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`إلغاء الحصة مع ${b.teacherName}`} style={s.cancel} disabled={props.cancellingId === b.id} onPress={() => props.onCancel(b.id)}>
                {props.cancellingId === b.id ? <ActivityIndicator color={colors.danger} /> : <Text style={s.cancelText}>إلغاء الحجز</Text>}
              </TouchableOpacity>
            </View>
          </View>)}</Surface>
        </> : null}

        {props.homework.length ? <>
          <SectionHeading title="بانتظارك" action="كل الواجبات" onPress={() => props.navigate("/homework")} />
          <Surface>{props.homework.map((h) => <TouchableOpacity key={h.id} accessibilityRole="button" style={s.homework} onPress={() => props.navigate("/homework")}>
            <View style={s.homeworkIcon}><Ionicons name="document-text-outline" color={colors.goldDark} size={22} /></View>
            <View style={{ flex: 1, gap: 4 }}><Text style={text.title}>{h.title}</Text><Text style={text.caption}>{h.status === "submitted" ? "تم التسليم · بانتظار المعلم" : `التسليم: ${props.formatDate(h.due_date)}`}</Text></View>
            <Ionicons name={backIcon} size={17} color={colors.inkSoft} />
          </TouchableOpacity>)}</Surface>
        </> : null}
        {props.latestLesson ? <>
          <SectionHeading title="آخر ما أنجزت" action="سجل الحصص" onPress={() => props.navigate("/lessons")} />
          <Surface><View style={s.labelRow}><Ionicons name="checkmark-circle-outline" size={23} color={colors.primary} /><Text style={text.title}>{props.latestLesson.surah}</Text></View><Text style={text.body}>{props.latestLesson.ayah_range} · مع {props.latestLesson.teacherName}</Text></Surface>
        </> : null}
      </> : null}

      <TouchableOpacity accessibilityRole="button" style={s.explore} onPress={() => props.navigate("/(tabs)/programs")} activeOpacity={0.8}>
        <View style={s.quickIcon}><Ionicons name="compass-outline" size={26} color={colors.primary} /></View>
        <View style={{ flex: 1, gap: 3 }}><Text style={text.title}>لكل هدف، مسار يناسبه</Text><Text style={text.body}>اكتشف برامج الحفظ والتلاوة والتجويد</Text></View>
        <Ionicons name={backIcon} color={colors.primary} size={19} />
      </TouchableOpacity>
      <SectionHeading title="المزيد من رحلتك" />
      <View style={s.moreGrid}>{MORE_LINKS.map((item) => <TouchableOpacity key={item.href} accessibilityRole="button" style={s.moreItem} onPress={() => props.navigate(item.href)} activeOpacity={0.75}>
        <Ionicons name={item.icon} size={20} color={colors.goldDark} /><Text style={s.moreText}>{item.title}</Text><Ionicons name={backIcon} size={15} color={colors.inkSoft} />
      </TouchableOpacity>)}</View>
    </>
  );
}

function getStyles(c: Palette) {
  return StyleSheet.create({
    header: { flexDirection: arabicRow, alignItems: "center", justifyContent: "space-between", gap: 14 },
    brand: { flexDirection: arabicRow, alignItems: "center", gap: 10, flex: 1 },
    brandMark: { backgroundColor: c.primaryLight, borderRadius: 17, width: 48, height: 48, alignItems: "center", justifyContent: "center" },
    brandTitle: { color: c.primary, fontFamily: fonts.extraBold, fontSize: 25, textAlign: "right" },
    greeting: { color: c.ink, fontFamily: fonts.extraBold, fontSize: 25, lineHeight: 38, textAlign: "right" },
    hero: { borderRadius: 28, padding: 22, gap: 14, overflow: "hidden" },
    heroCircle: { position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 36, borderColor: "#FFFFFF06", left: -90, top: -90 },
    heroTop: { flexDirection: arabicRow, justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" },
    heroPill: { flexDirection: arabicRow, alignItems: "center", gap: 7 },
    heroCaption: { color: "#F0D49A", fontFamily: fonts.bold, fontSize: 13 },
    heroTitle: { color: "#FFFFFF", fontFamily: fonts.extraBold, fontSize: 25, lineHeight: 36, textAlign: "right" },
    heroBody: { color: "#E0ECE5", fontFamily: fonts.regular, fontSize: 15, lineHeight: 25, textAlign: "right" },
    heroButton: { minHeight: 52, padding: 14, borderRadius: 16, backgroundColor: "#F5E5BE", flexDirection: arabicRow, alignItems: "center", justifyContent: "center", gap: 10 },
    heroButtonText: { color: "#163E33", fontFamily: fonts.bold, fontSize: 15, flexShrink: 1, textAlign: "center" },
    heroCancel: { minHeight: 44, alignItems: "center", justifyContent: "center", alignSelf: "center", paddingHorizontal: 16 },
    heroCancelText: { color: "#E0ECE5", fontFamily: fonts.medium, fontSize: 13, textDecorationLine: "underline" },
    live: { flexDirection: arabicRow, gap: 5, alignItems: "center" },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#B2E6C2" },
    liveText: { fontSize: 11, color: "#D5F2DF", fontFamily: fonts.medium },
    quickGrid: { flexDirection: arabicRow, flexWrap: "wrap", gap: 10 },
    quickItem: { flexBasis: "21%", flexGrow: 1, alignItems: "center", gap: 7, paddingVertical: 10 },
    quickIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: c.primaryLight, alignItems: "center", justifyContent: "center" },
    quickTitle: { color: c.ink, fontFamily: fonts.bold, fontSize: 13, textAlign: "center" },
    quickSubtitle: { color: c.inkSoft, fontFamily: fonts.regular, fontSize: 11, textAlign: "center" },
    between: { flexDirection: arabicRow, alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
    labelRow: { flexDirection: arabicRow, alignItems: "center", gap: 8 },
    badge: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: c.primaryLight },
    badgeText: { color: c.primary, fontFamily: fonts.bold, fontSize: 12, textAlign: "right" },
    portion: { borderRadius: 16, backgroundColor: c.bg, padding: 16, gap: 5 },
    portionLabel: { color: c.inkSoft, fontFamily: fonts.regular, fontSize: 12, textAlign: "right" },
    portionText: { color: c.ink, fontFamily: fonts.bold, fontSize: 17, lineHeight: 27, textAlign: "right" },
    portionDivider: { height: 1, backgroundColor: c.line, marginVertical: 5 },
    percent: { color: c.primary, fontFamily: fonts.extraBold, fontSize: 18 },
    track: { height: 8, borderRadius: 8, backgroundColor: c.primaryLight, overflow: "hidden", alignItems: "flex-end" },
    fill: { height: 8, borderRadius: 8, backgroundColor: c.primary },
    teacher: { flexDirection: arabicRow, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: c.line, backgroundColor: c.card, alignItems: "center", gap: 12 },
    teacherAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.primaryLight, alignItems: "center", justifyContent: "center" },
    booking: { flexDirection: arabicRow, gap: 12, alignItems: "center", borderBottomWidth: 1, borderColor: c.line, paddingVertical: 10 },
    join: { minHeight: 44, minWidth: 64, borderRadius: 12, backgroundColor: c.primaryLight, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
    joinText: { fontFamily: fonts.bold, color: c.primary, fontSize: 14 },
    cancel: { minHeight: 44, alignItems: "center", justifyContent: "center" },
    cancelText: { fontFamily: fonts.medium, color: c.danger, fontSize: 12 },
    homework: { flexDirection: arabicRow, gap: 12, alignItems: "center", paddingVertical: 5, minHeight: 64 },
    homeworkIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.goldLight, alignItems: "center", justifyContent: "center" },
    explore: { flexDirection: arabicRow, gap: 14, alignItems: "center", borderRadius: 22, padding: 18, backgroundColor: c.primaryLight },
    moreGrid: { flexDirection: arabicRow, flexWrap: "wrap", gap: 10 },
    moreItem: { flexDirection: arabicRow, alignItems: "center", flexBasis: "45%", flexGrow: 1, gap: 8, padding: 14, minHeight: 60, borderRadius: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
    moreText: { flex: 1, color: c.ink, fontFamily: fonts.bold, fontSize: 13, textAlign: "right" },
    error: { flexDirection: arabicRow, backgroundColor: c.card, borderWidth: 1, borderColor: c.danger, borderRadius: 18, padding: 14, alignItems: "center", gap: 10, flexWrap: "wrap" },
    retry: { minHeight: 44, justifyContent: "center", paddingHorizontal: 6 },
  });
}
