import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/auth";
import { programs } from "../../lib/programs";
import { getMyStudentProfile } from "../../lib/studentProfile";
import { fonts, Palette, useTheme } from "../../lib/theme";
import { arabicRow, backIcon, EmptyCard, studentText } from "../../components/student/ui";

const ICONS = { "hifz-mutqan": "book-outline", "tilawa-tajweed": "mic-outline", "muraja-hifz": "repeat-outline", "qiraat-ashr": "ribbon-outline", "bara-em-mutqin": "happy-outline", "barnamej-nisaa": "flower-outline" } as const;
const FILTERS = [
  { key: "all", title: "كل البرامج" },
  { key: "hifz", title: "الحفظ والمراجعة" },
  { key: "tilawa", title: "التلاوة والإجازة" },
  { key: "special", title: "الأطفال والنساء" },
] as const;
type Filter = typeof FILTERS[number]["key"];
function normalize(text: string) { return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").trim().toLowerCase(); }

export default function ProgramsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const s = getStyles(colors);
  const text = studentText(colors);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const userId = session?.user?.id;

  useFocusEffect(useCallback(() => {
    let active = true;
    if (userId) getMyStudentProfile(userId).then(({ student }) => {
      if (active) setCurrentSlug(student?.program_slug ?? null);
    }).catch(() => {});
    return () => { active = false; };
  }, [userId]));

  const visible = useMemo(() => programs.filter((p) => {
    const matchesFilter = filter === "all" ||
      (filter === "hifz" && ["hifz-mutqan", "muraja-hifz"].includes(p.slug)) ||
      (filter === "tilawa" && ["tilawa-tajweed", "qiraat-ashr"].includes(p.slug)) ||
      (filter === "special" && ["children", "women"].includes(p.category));
    return matchesFilter && normalize([p.title, p.short, ...(p.courses?.map((c) => c.title) ?? [])].join(" ")).includes(normalize(query));
  }).sort((a, b) => Number(b.slug === currentSlug) - Number(a.slug === currentSlug)), [query, filter, currentSlug]);

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "left", "right"]}>
    <FlatList data={visible} keyExtractor={(item) => item.slug} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.content}
      ListHeaderComponent={<View style={{ gap: 18 }}>
        <View style={s.eyebrow}><Ionicons name="compass-outline" size={20} color={colors.primary} /><Text style={s.eyebrowText}>مسارات متقن</Text></View>
        <View style={{ gap: 6 }}><Text accessibilityRole="header" style={s.heading}>لكل هدف، بداية.</Text><Text style={text.body}>اختر ما يناسب رحلتك مع كتاب الله، وتعرّف على تفاصيل كل برنامج.</Text></View>
        <View style={s.search}>
          <Ionicons name="search-outline" size={21} color={colors.inkSoft} />
          <TextInput accessibilityLabel="ابحث عن برنامج أو دورة" placeholder="ابحث عن برنامج أو دورة…" placeholderTextColor={colors.inkSoft} value={query} onChangeText={setQuery} returnKeyType="search" style={s.searchInput} />
          {query ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="مسح البحث" style={s.clear} onPress={() => setQuery("")}><Ionicons name="close-circle" size={22} color={colors.inkSoft} /></TouchableOpacity> : null}
        </View>
        <View style={s.filters}>{FILTERS.map((item) => <TouchableOpacity key={item.key} accessibilityRole="button" accessibilityState={{ selected: filter === item.key }} style={[s.filter, filter === item.key && s.activeFilter]} onPress={() => setFilter(item.key)}>
          <Text style={[s.filterText, filter === item.key && { color: colors.primary }]}>{item.title}</Text>
        </TouchableOpacity>)}</View>
        <View style={s.resultRow}><Text style={text.title}>{visible.length === 0 ? "لا توجد نتائج" : visible.length === 1 ? "برنامج واحد متاح" : visible.length === 2 ? "برنامجان متاحان" : `${visible.length} برامج متاحة`}</Text><Text style={text.caption}>{currentSlug ? "برنامجك الحالي يظهر أولًا" : "تعلّم بإشراف متخصص"}</Text></View>
      </View>}
      ListEmptyComponent={<EmptyCard icon="search-outline" title="لم نجد برنامجًا بهذا الاسم" description="جرّب كلمة أخرى أو اعرض جميع البرامج." action="عرض كل البرامج" onPress={() => { setQuery(""); setFilter("all"); }} />}
      renderItem={({ item }) => {
        const current = currentSlug === item.slug;
        return <Link href={`/programs/${item.slug}`} asChild><TouchableOpacity accessibilityRole="button" accessibilityLabel={`${item.title}${current ? "، برنامجك الحالي" : ""}، عرض التفاصيل`} activeOpacity={0.8} style={[s.card, current && { borderColor: colors.primary }]}>
          <View style={s.cardTop}><View style={s.icon}><Ionicons name={ICONS[item.slug as keyof typeof ICONS] ?? "book-outline"} size={27} color={colors.primary} /></View>
            {current ? <View style={s.current}><Ionicons name="checkmark-circle" size={15} color={colors.primary} /><Text style={s.currentText}>برنامجك الحالي</Text></View> : null}
          </View>
          <Text style={s.cardTitle}>{item.title}</Text><Text style={text.body}>{item.short}</Text>
          <View style={s.detail}><Ionicons name="people-outline" size={15} color={colors.inkSoft} /><Text style={text.caption}>{item.ageGroup}</Text></View>
          <View style={s.cardFooter}><Text style={s.cardAction}>اكتشف البرنامج</Text><Text style={text.caption}>{item.courses?.length ? `${item.courses.length} دورات` : `${item.features.length} مزايا تعليمية`}</Text><Ionicons name={backIcon} color={colors.primary} size={18} /></View>
        </TouchableOpacity></Link>;
      }} />
  </SafeAreaView>;
}
function getStyles(c: Palette) {
  return StyleSheet.create({
    content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: 20, gap: 16, paddingBottom: 32 },
    eyebrow: { flexDirection: arabicRow, alignItems: "center", gap: 7 },
    eyebrowText: { fontFamily: fonts.bold, color: c.primary, fontSize: 13 },
    heading: { fontFamily: fonts.extraBold, color: c.ink, fontSize: 30, lineHeight: 44, textAlign: "right" },
    search: { flexDirection: arabicRow, alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, borderColor: c.line, backgroundColor: c.card, paddingHorizontal: 14, minHeight: 56 },
    searchInput: { flex: 1, minHeight: 54, fontFamily: fonts.regular, fontSize: 14, color: c.ink, textAlign: "right" },
    clear: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
    filters: { flexDirection: arabicRow, flexWrap: "wrap", gap: 8 },
    filter: { minHeight: 44, justifyContent: "center", borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: c.line, backgroundColor: c.card },
    activeFilter: { backgroundColor: c.primaryLight, borderColor: c.primary },
    filterText: { fontFamily: fonts.bold, fontSize: 12, color: c.inkSoft },
    resultRow: { flexDirection: arabicRow, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 2 },
    card: { borderRadius: 24, padding: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, gap: 10 },
    cardTop: { flexDirection: arabicRow, alignItems: "center", justifyContent: "space-between", gap: 8 },
    icon: { width: 56, height: 56, borderRadius: 19, backgroundColor: c.primaryLight, alignItems: "center", justifyContent: "center" },
    current: { flexDirection: arabicRow, gap: 5, alignItems: "center", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10, backgroundColor: c.primaryLight },
    currentText: { fontFamily: fonts.bold, color: c.primary, fontSize: 12 },
    cardTitle: { fontFamily: fonts.extraBold, color: c.ink, fontSize: 21, lineHeight: 31, textAlign: "right" },
    detail: { flexDirection: arabicRow, gap: 6, alignItems: "center" },
    cardFooter: { flexDirection: arabicRow, alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 16, marginTop: 5 },
    cardAction: { fontFamily: fonts.bold, color: c.primary, fontSize: 14, flex: 1, textAlign: "right" },
  });
}
