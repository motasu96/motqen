import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import { GroupWithTeacher, joinGroup, leaveGroup, listAllGroupsForStudents, listMyGroupEnrollmentIds } from "../../lib/groups";
import { getProgramBySlug } from "../../lib/programs";
import { useLiveRooms } from "../../lib/presence";
import PulseBadge from "../../components/PulseBadge";
import { fonts, Palette, radius, shadow, useTheme } from "../../lib/theme";

const DAY_LABELS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function GroupsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const studentId = session?.user?.id;
  const { teacherId: teacherIdFilter } = useLocalSearchParams<{ teacherId?: string }>();

  const [groups, setGroups] = useState<GroupWithTeacher[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const liveRooms = useLiveRooms();

  const load = useCallback(async () => {
    if (!studentId) return;
    const [allGroups, myEnrollments] = await Promise.all([
      listAllGroupsForStudents(),
      listMyGroupEnrollmentIds(studentId),
    ]);
    setGroups(allGroups);
    setEnrolledIds(myEnrollments);
  }, [studentId]);

  // Refetches whenever this tab regains focus (silently, without flashing
  // the full-screen spinner again — that only shows on the very first load).
  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleJoin(groupId: string) {
    if (!studentId) return;
    setActingOn(groupId);
    const ok = await joinGroup(groupId, studentId);
    setActingOn(null);
    if (ok) {
      setEnrolledIds((prev) => new Set(prev).add(groupId));
      setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, enrolledCount: g.enrolledCount + 1 } : g)));
    }
  }

  function handleLeave(groupId: string) {
    Alert.alert("إلغاء الانضمام", "هل أنت متأكد من إلغاء انضمامك لهذه الحلقة؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "إلغاء الانضمام",
        style: "destructive",
        onPress: async () => {
          if (!studentId) return;
          setActingOn(groupId);
          const ok = await leaveGroup(groupId, studentId);
          setActingOn(null);
          if (ok) {
            setEnrolledIds((prev) => {
              const next = new Set(prev);
              next.delete(groupId);
              return next;
            });
            setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, enrolledCount: Math.max(0, g.enrolledCount - 1) } : g)));
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top", "left", "right"]}>
        <ActivityIndicator color={colors.gold} size="large" />
      </SafeAreaView>
    );
  }

  const visibleGroups = teacherIdFilter ? groups.filter((g) => g.teacher_id === teacherIdFilter) : groups;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={visibleGroups}
        keyExtractor={(g) => g.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        ListHeaderComponent={
          teacherIdFilter ? (
            <TouchableOpacity onPress={() => router.setParams({ teacherId: undefined })} style={{ marginBottom: 12 }}>
              <Text style={styles.showAllLink}>عرض كل الحلقات</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={40} color={colors.line} />
            <Text style={styles.empty}>
              {teacherIdFilter ? "لا توجد حلقات جماعية متاحة لهذا المعلم حاليًا" : "لا توجد حلقات جماعية متاحة حاليًا"}
            </Text>
          </View>
        }
        renderItem={({ item: g }) => {
          const program = getProgramBySlug(g.program_slug ?? "");
          const course = program?.courses?.find((c) => c.slug === g.course_slug);
          const enrolled = enrolledIds.has(g.id);
          const spotsLeft = g.capacity - g.enrolledCount;
          const isFull = spotsLeft <= 0 && !enrolled;
          const busy = actingOn === g.id;

          return (
            <View style={styles.card}>
              <View style={styles.badgeRow}>
                {program && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{program.title}</Text>
                  </View>
                )}
                {course && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{course.title}</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.title}>{g.title}</Text>
                {liveRooms.get(g.id)?.teacherPresent && <PulseBadge color="red" label="مباشر الآن" />}
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.inkSoft} />
                <Text style={styles.meta}>
                  {DAY_LABELS[g.day_of_week] ?? ""} · {g.session_time}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={14} color={colors.inkSoft} />
                <Text style={styles.meta}>مع {g.teacherName}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={14} color={colors.inkSoft} />
                <Text style={styles.meta}>
                  {g.enrolledCount} / {g.capacity} {isFull ? "(مكتملة)" : ""}
                </Text>
              </View>

              {enrolled ? (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.joinButton]}
                    onPress={() => router.push(`/room/${g.id}`)}
                  >
                    <Ionicons name="videocam" size={15} color="#fff" />
                    <Text style={styles.buttonText}>دخول الحصة</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.leaveButton]}
                    disabled={busy}
                    onPress={() => handleLeave(g.id)}
                  >
                    <Text style={styles.leaveButtonText}>إلغاء الانضمام</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.joinButton, isFull && styles.buttonDisabled]}
                  disabled={isFull || busy}
                  onPress={() => handleJoin(g.id)}
                >
                  <Text style={styles.buttonText}>{isFull ? "الحلقة مكتملة" : "انضم إلى الحلقة"}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function getStyles(colors: Palette) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  showAllLink: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldDark, textAlign: "right" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  emptyWrap: { alignItems: "center", marginTop: 60, gap: 10 },
  empty: { textAlign: "center", color: colors.inkSoft, fontFamily: fonts.regular },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  // Plain "row": on the app's Arabic locale, RN auto-mirrors it to
  // right-to-left, so the first badge already lands on the right.
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 6 },
  badge: { backgroundColor: colors.goldLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldDark },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, textAlign: "right" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3, justifyContent: "flex-start" },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, textAlign: "right" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  button: { flex: 1, flexDirection: "row", gap: 6, borderRadius: radius.sm, paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  joinButton: { backgroundColor: colors.gold },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontFamily: fonts.bold, fontSize: 13 },
  leaveButton: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  leaveButtonText: { color: colors.inkSoft, fontFamily: fonts.bold, fontSize: 13 },
  });
}
