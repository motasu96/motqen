import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import { GroupWithTeacher, joinGroup, leaveGroup, listAllGroupsForStudents, listMyGroupEnrollmentIds } from "../../lib/groups";
import { getProgramBySlug } from "../../lib/programs";
import { colors } from "../../lib/theme";

const DAY_LABELS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function GroupsScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const studentId = session?.user?.id;

  const [groups, setGroups] = useState<GroupWithTeacher[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) return;
    const [allGroups, myEnrollments] = await Promise.all([
      listAllGroupsForStudents(),
      listMyGroupEnrollmentIds(studentId),
    ]);
    setGroups(allGroups);
    setEnrolledIds(myEnrollments);
  }, [studentId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

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

  async function handleLeave(groupId: string) {
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
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={groups}
      keyExtractor={(g) => g.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      ListEmptyComponent={<Text style={styles.empty}>لا توجد حلقات جماعية متاحة حاليًا</Text>}
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
            <Text style={styles.title}>{g.title}</Text>
            <Text style={styles.meta}>
              {DAY_LABELS[g.day_of_week] ?? ""} · {g.session_time}
            </Text>
            <Text style={styles.meta}>مع {g.teacherName}</Text>
            <Text style={styles.meta}>
              {g.enrolledCount} / {g.capacity} {isFull ? "(مكتملة)" : ""}
            </Text>

            {enrolled ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.button, styles.joinButton]}
                  onPress={() => router.push(`/room/${g.id}`)}
                >
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  empty: { textAlign: "center", color: colors.inkSoft, marginTop: 40 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.line },
  badgeRow: { flexDirection: "row-reverse", gap: 6, flexWrap: "wrap", marginBottom: 6 },
  badge: { backgroundColor: colors.goldLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700", color: colors.goldDark },
  title: { fontSize: 16, fontWeight: "800", color: colors.ink, textAlign: "right" },
  meta: { fontSize: 12, color: colors.inkSoft, textAlign: "right", marginTop: 2 },
  actionsRow: { flexDirection: "row-reverse", gap: 8, marginTop: 12 },
  button: { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: "center" },
  joinButton: { backgroundColor: colors.gold },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  leaveButton: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  leaveButtonText: { color: colors.inkSoft, fontWeight: "700", fontSize: 13 },
});
