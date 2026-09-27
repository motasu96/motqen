"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useTeacherNav } from "@/components/dashboard/teacherNav";
import { useTeacherLogout } from "@/lib/supabase/useTeacherLogout";
import { useTeacherProfile } from "@/lib/supabase/useTeacherProfile";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId } from "@/lib/supabase/teacherStudents";
import { createGroup, deleteGroup, GroupWithMembers, listTeacherGroups } from "@/lib/supabase/groups";
import {
  getGroupAttendanceForDate,
  GroupAttendanceRow,
  listGroupAttendanceDates,
  listGroupAttendanceHistory,
  saveGroupAttendance,
  StudentAttendance,
} from "@/lib/supabase/groupAttendance";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import PulseBadge from "@/components/dashboard/PulseBadge";
import { useLiveRooms } from "@/lib/supabase/presence";
import { useToast } from "@/components/Toast";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { IconCalendar, IconCheck, IconClock, IconFamily, IconPencil, IconX } from "@/components/icons";

type FormState = {
  title: string;
  titleEn: string;
  programSlug: string;
  courseSlug: string;
  dayOfWeek: number;
  sessionTime: string;
  capacity: string;
};

function emptyForm(defaultTime: string): FormState {
  return {
    title: "",
    titleEn: "",
    programSlug: programs[0]?.slug ?? "",
    courseSlug: "",
    dayOfWeek: 0,
    sessionTime: defaultTime,
    capacity: "6",
  };
}

function GroupAttendancePanel({
  group,
  sessionDate,
  records,
  ready,
  saving,
  loggedDates,
  onSelectDate,
  onToggle,
  onUpdateField,
  onSave,
  onClose,
}: {
  group: GroupWithMembers;
  sessionDate: string;
  records: Map<string, StudentAttendance>;
  ready: boolean;
  saving: boolean;
  loggedDates: string[];
  onSelectDate: (date: string) => void;
  onToggle: (studentId: string, attended: boolean) => void;
  onUpdateField: (studentId: string, field: "recitationFrom" | "recitationTo" | "grade", value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");

  return (
    <div className="card animate-fade-up flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-extrabold text-ink">{t("attendanceTitle")}</h4>
        <button onClick={onClose} className="text-xs font-bold text-ink-soft hover:text-gold-dark">
          {tc("cancel")}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-ink-soft">{t("attendanceDateLabel")}</label>
        <input
          type="date"
          value={sessionDate}
          onChange={(e) => onSelectDate(e.target.value)}
          className="input w-48 py-2 text-xs"
        />
      </div>

      {group.enrolledMembers.length === 0 ? (
        <p className="text-sm text-ink-soft">{t("noMembersForAttendance")}</p>
      ) : !ready ? null : (
        <div className="flex flex-col gap-2">
          {group.enrolledMembers.map((m) => {
            const rec = records.get(m.id) ?? { attended: true, recitationFrom: "", recitationTo: "", grade: "", notes: "" };
            return (
              <div key={m.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-bg px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-ink">{m.name}</span>
                  <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-card p-1">
                    <button
                      type="button"
                      onClick={() => onToggle(m.id, true)}
                      aria-pressed={rec.attended}
                      className={`rounded-pill px-3 py-1 text-xs font-bold transition-colors ${rec.attended ? "bg-gold-gradient text-white" : "text-ink-soft"}`}
                    >
                      {t("attendedCta")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggle(m.id, false)}
                      aria-pressed={!rec.attended}
                      className={`rounded-pill px-3 py-1 text-xs font-bold transition-colors ${!rec.attended ? "bg-red-500 text-white" : "text-ink-soft"}`}
                    >
                      {t("absentCta")}
                    </button>
                  </div>
                </div>
                {rec.attended && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      value={rec.recitationFrom}
                      onChange={(e) => onUpdateField(m.id, "recitationFrom", e.target.value)}
                      placeholder={t("attendanceFromPlaceholder")}
                      className="input py-2 text-xs"
                    />
                    <input
                      value={rec.recitationTo}
                      onChange={(e) => onUpdateField(m.id, "recitationTo", e.target.value)}
                      placeholder={t("attendanceToPlaceholder")}
                      className="input py-2 text-xs"
                    />
                    <input
                      value={rec.grade}
                      onChange={(e) => onUpdateField(m.id, "grade", e.target.value)}
                      placeholder={t("attendanceGradePlaceholder")}
                      className="input py-2 text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button onClick={onSave} disabled={saving || group.enrolledMembers.length === 0} className="btn-primary w-fit disabled:opacity-70">
        {saving ? t("saving") : t("attendanceSaveCta")}
      </button>

      {loggedDates.length > 0 && (
        <div className="border-t border-line pt-3">
          <h5 className="mb-2 text-xs font-extrabold text-ink-soft">{t("attendanceHistoryTitle")}</h5>
          <div className="flex flex-wrap gap-2">
            {loggedDates.map((d) => (
              <button
                key={d}
                onClick={() => onSelectDate(d)}
                className={`rounded-pill px-3 py-1 text-xs font-bold transition-colors ${
                  d === sessionDate ? "bg-gold-gradient text-white" : "border border-line text-ink-soft hover:text-gold-dark"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Independent side list (rendered via DashboardShell's rightPanel, its own
// column on the right of the page, not inline with the attendance form)
// showing every enrolled student's attendance rate and clickable history —
// clicking an entry jumps the attendance form above to that date.
function StudentHistorySidePanel({
  group,
  history,
  selectedDate,
  onSelectDate,
}: {
  group: GroupWithMembers;
  history: GroupAttendanceRow[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const t = useTranslations("Dashboard.teacher");

  const historyByStudent = new Map<string, GroupAttendanceRow[]>();
  for (const row of history) {
    const list = historyByStudent.get(row.student_id) ?? [];
    list.push(row);
    historyByStudent.set(row.student_id, list);
  }

  return (
    <div className="card flex max-h-[calc(100vh-8rem)] flex-col gap-4 overflow-y-auto p-5">
      <h4 className="text-sm font-extrabold text-ink">{t("studentHistoryTitle")}</h4>
      {group.enrolledMembers.length === 0 ? (
        <p className="text-xs text-ink-soft">{t("noMembersForAttendance")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {group.enrolledMembers.map((m) => {
            const entries = historyByStudent.get(m.id) ?? [];
            const attendedCount = entries.filter((e) => e.attended).length;
            return (
              <div key={m.id} className="flex flex-col gap-2 border-b border-line pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{m.name}</span>
                  {entries.length > 0 && (
                    <span className="shrink-0 rounded-pill bg-gold-light px-2.5 py-0.5 text-[11px] font-bold text-gold-dark">
                      {attendedCount}/{entries.length}
                    </span>
                  )}
                </div>
                {entries.length === 0 ? (
                  <p className="text-xs text-ink-soft">{t("noAttendanceHistoryForStudent")}</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => onSelectDate(entry.session_date)}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 text-start text-xs transition-colors ${
                          entry.session_date === selectedDate ? "border-gold bg-gold-light" : "border-line bg-bg hover:border-gold/60"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-bold text-ink">
                          {entry.attended ? (
                            <IconCheck className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <IconX className="h-3 w-3 shrink-0 text-red-500" aria-hidden="true" />
                          )}
                          {entry.session_date}
                        </span>
                        <span className="flex items-center gap-1.5 text-ink-soft">
                          {entry.grade && <span className="font-bold text-gold-dark">{entry.grade}</span>}
                          <IconPencil className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeacherGroupsPageInner() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const { showToast } = useToast();
  const dayLabels = tc.raw("weekDaysSaturdayFirst") as string[];
  const liveRooms = useLiveRooms();
  const timeSlots = tc.raw("timeSlots") as string[];
  const searchParams = useSearchParams();
  const openLogId = searchParams.get("openLog");

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [ready, setReady] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [openAttendanceGroupId, setOpenAttendanceGroupId] = useState<string | null>(openLogId);

  const [attendanceSessionDate, setAttendanceSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, StudentAttendance>>(new Map());
  const [attendanceLoggedDates, setAttendanceLoggedDates] = useState<string[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<GroupAttendanceRow[]>([]);
  const [attendanceReady, setAttendanceReady] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(timeSlots[0] ?? ""));
  const [saving, setSaving] = useState(false);

  const openGroup = groups.find((g) => g.id === openAttendanceGroupId) ?? null;

  async function loadAttendanceForDate(group: GroupWithMembers, date: string) {
    setAttendanceReady(false);
    const existing = await getGroupAttendanceForDate(createClient(), group.id, date);
    const merged = new Map<string, StudentAttendance>();
    for (const m of group.enrolledMembers) {
      merged.set(m.id, existing.get(m.id) ?? { attended: true, recitationFrom: "", recitationTo: "", grade: "", notes: "" });
    }
    setAttendanceRecords(merged);
    setAttendanceReady(true);
  }

  async function refreshAttendanceHistory(groupId: string) {
    const rows = await listGroupAttendanceHistory(createClient(), groupId);
    setAttendanceHistory(rows);
  }

  useEffect(() => {
    if (!openGroup) return;
    let cancelled = false;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [dates] = await Promise.all([
        listGroupAttendanceDates(createClient(), openGroup.id),
        refreshAttendanceHistory(openGroup.id),
      ]);
      if (cancelled) return;
      setAttendanceLoggedDates(dates);
      setAttendanceSessionDate(today);
      await loadAttendanceForDate(openGroup, today);
    })();
    return () => {
      cancelled = true;
    };
    // groups is included so this also fires once groups finishes loading
    // when the panel is auto-opened from the ?openLog= query param on
    // mount (before the groups list has arrived yet).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAttendanceGroupId, groups]);

  async function selectAttendanceDate(date: string) {
    if (!openGroup) return;
    setAttendanceSessionDate(date);
    await loadAttendanceForDate(openGroup, date);
  }

  function toggleAttendance(studentId: string, attended: boolean) {
    setAttendanceRecords((prev) => {
      const next = new Map(prev);
      const cur = next.get(studentId) ?? { attended: true, recitationFrom: "", recitationTo: "", grade: "", notes: "" };
      next.set(studentId, { ...cur, attended });
      return next;
    });
  }

  function updateAttendanceField(studentId: string, field: "recitationFrom" | "recitationTo" | "grade", value: string) {
    setAttendanceRecords((prev) => {
      const next = new Map(prev);
      const cur = next.get(studentId) ?? { attended: true, recitationFrom: "", recitationTo: "", grade: "", notes: "" };
      next.set(studentId, { ...cur, [field]: value });
      return next;
    });
  }

  async function handleSaveAttendance() {
    if (!openGroup || !teacherId) return;
    setAttendanceSaving(true);
    const ok = await saveGroupAttendance(createClient(), {
      groupId: openGroup.id,
      teacherId,
      sessionDate: attendanceSessionDate,
      records: openGroup.enrolledMembers.map((m) => ({
        studentId: m.id,
        attended: attendanceRecords.get(m.id)?.attended ?? true,
        recitationFrom: attendanceRecords.get(m.id)?.recitationFrom ?? "",
        recitationTo: attendanceRecords.get(m.id)?.recitationTo ?? "",
        grade: attendanceRecords.get(m.id)?.grade ?? "",
        notes: attendanceRecords.get(m.id)?.notes ?? "",
      })),
    });
    setAttendanceSaving(false);
    if (!ok) {
      showToast(t("errorAttendanceSave"), "error");
      return;
    }
    showToast(t("toastAttendanceSaved"), "success");
    setAttendanceLoggedDates((prev) =>
      prev.includes(attendanceSessionDate) ? prev : [...prev, attendanceSessionDate].sort().reverse()
    );
    await refreshAttendanceHistory(openGroup.id);
  }

  async function loadGroups(tId: string) {
    const supabase = createClient();
    const rows = await listTeacherGroups(supabase, tId);
    setGroups(rows);
    setReady(true);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setReady(true);
        return;
      }
      const tId = await getMyTeacherId(supabase, user.id);
      if (!tId || cancelled) {
        setReady(true);
        return;
      }
      setTeacherId(tId);
      await loadGroups(tId);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreate() {
    setForm(emptyForm(timeSlots[0] ?? ""));
    setShowCreate(true);
  }

  async function handleCreate() {
    if (!teacherId) return;
    const capacity = Number(form.capacity);
    if (!form.title.trim() || !form.programSlug || !capacity || capacity <= 0) {
      showToast(t("errorGroupFields"), "error");
      return;
    }
    setSaving(true);
    const ok = await createGroup(createClient(), {
      teacherId,
      title: form.title.trim(),
      titleEn: form.titleEn.trim(),
      programSlug: form.programSlug,
      courseSlug: form.courseSlug || undefined,
      dayOfWeek: form.dayOfWeek,
      sessionTime: form.sessionTime,
      capacity,
    });
    setSaving(false);
    if (!ok) {
      showToast(t("errorGroupSave"), "error");
      return;
    }
    showToast(t("groupCreated"), "success");
    setShowCreate(false);
    await loadGroups(teacherId);
  }

  async function handleDelete(id: string) {
    if (!teacherId || !window.confirm(t("confirmDeleteGroup"))) return;
    setActingOn(id);
    const ok = await deleteGroup(createClient(), id);
    if (ok) {
      showToast(t("groupDeleted"), "success");
      await loadGroups(teacherId);
    }
    setActingOn(null);
  }

  return (
    <DashboardShell
      navItems={teacherNav}
      userName={teacherName}
      userSubtitle={teacherTitle}
      onLogout={handleLogout}
      rightPanel={
        openGroup ? (
          <StudentHistorySidePanel
            group={openGroup}
            history={attendanceHistory}
            selectedDate={attendanceSessionDate}
            onSelectDate={selectAttendanceDate}
          />
        ) : undefined
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader title={t("groupsTitle")} subtitle={t("groupsSubtitle")} />
        {teacherId && (
          <button onClick={openCreate} className="btn-primary shrink-0">
            {t("addGroupCta")}
          </button>
        )}
      </div>

      {!ready ? null : groups.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noGroupsYetTeacher")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {groups.map((g) => {
            const program = programs.find((p) => p.slug === g.program_slug);
            const programTitle = program ? localize(program, locale).title : tc("dash");
            const course = program?.courses?.find((c) => c.slug === g.course_slug);
            const courseTitle = course ? localize(course, locale).title : null;
            const title = locale === "en" && g.title_en ? g.title_en : g.title;
            const dayLabel = dayLabels[g.day_of_week] ?? "";

            return (
              <div key={g.id} className="card flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
                      <IconFamily className="h-5 w-5 text-gold-dark" />
                    </span>
                    <div>
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        <span className="badge w-fit">{programTitle}</span>
                        {courseTitle && <span className="badge w-fit">{courseTitle}</span>}
                      </div>
                      <h3 className="text-base font-extrabold leading-snug text-ink">{title}</h3>
                      {(liveRooms.get(g.id)?.studentCount ?? 0) > 0 && (
                        <PulseBadge color="red" label={tc("liveNowBadge")} className="mt-1.5" />
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-pill bg-bg px-3 py-1 text-xs font-bold text-ink-soft">
                    {g.enrolledCount} / {g.capacity}
                  </span>
                </div>

                <div className="flex flex-col gap-2 border-y border-line py-4 text-sm">
                  <div className="flex items-center gap-2 text-ink-soft">
                    <IconCalendar className="h-4 w-4 text-gold" />
                    {dayLabel} · {g.session_time}
                  </div>
                  <div className="flex items-center gap-2 text-ink-soft">
                    <IconClock className="h-4 w-4 text-gold" />
                    {tc("capacityLabel")}: {g.capacity}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-extrabold text-ink-soft">{tc("enrolledLabel")}</h4>
                  {g.enrolledNames.length === 0 ? (
                    <p className="text-xs text-ink-soft">—</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {g.enrolledNames.map((name, i) => (
                        <span key={`${g.id}-${i}`} className="badge">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <JoinMeetingButton
                    room={g.id}
                    displayName={teacherName}
                    subject={title}
                    label={t("startGroupSession")}
                    className="flex-1 justify-center"
                    logOnLeave
                    lobby
                    role="teacher"
                  />
                  <button
                    onClick={() => setOpenAttendanceGroupId(openAttendanceGroupId === g.id ? null : g.id)}
                    className="rounded-pill border border-line px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-bg hover:text-gold-dark"
                  >
                    {t("attendanceCta")}
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    disabled={actingOn === g.id}
                    className="rounded-pill border border-line px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-bg hover:text-red-500 disabled:opacity-50"
                  >
                    {t("deleteGroupCta")}
                  </button>
                </div>

                {openAttendanceGroupId === g.id && teacherId && (
                  <GroupAttendancePanel
                    group={g}
                    sessionDate={attendanceSessionDate}
                    records={attendanceRecords}
                    ready={attendanceReady}
                    saving={attendanceSaving}
                    loggedDates={attendanceLoggedDates}
                    onSelectDate={selectAttendanceDate}
                    onToggle={toggleAttendance}
                    onUpdateField={updateAttendanceField}
                    onSave={handleSaveAttendance}
                    onClose={() => setOpenAttendanceGroupId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="animate-overlay-in absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="card animate-fade-up relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-7">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink">{t("newGroupModalTitle")}</h3>
              <button onClick={() => setShowCreate(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">
                <IconX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("groupFieldTitle")}</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("groupFieldTitleEn")}</label>
                  <input dir="ltr" className="input" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">{t("groupFieldProgram")}</label>
                <select
                  className="input"
                  value={form.programSlug}
                  onChange={(e) => setForm({ ...form, programSlug: e.target.value, courseSlug: "" })}
                >
                  {programs.map((p0) => {
                    const p = localize(p0, locale);
                    return (
                      <option key={p.slug} value={p.slug}>
                        {p.title}
                      </option>
                    );
                  })}
                </select>
              </div>

              {(() => {
                const selectedProgram = programs.find((p) => p.slug === form.programSlug);
                if (!selectedProgram?.courses || selectedProgram.courses.length === 0) return null;
                return (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-ink">{t("groupFieldCourse")}</label>
                    <select
                      className="input"
                      value={form.courseSlug}
                      onChange={(e) => setForm({ ...form, courseSlug: e.target.value })}
                    >
                      <option value="">{t("groupFieldCourseNone")}</option>
                      {selectedProgram.courses.map((c0) => {
                        const c = localize(c0, locale);
                        return (
                          <option key={c.slug} value={c.slug}>
                            {c.title}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })()}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("groupFieldDay")}</label>
                  <select
                    className="input"
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
                  >
                    {dayLabels.map((label, i) => (
                      <option key={label} value={i}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("groupFieldTime")}</label>
                  <select className="input" value={form.sessionTime} onChange={(e) => setForm({ ...form, sessionTime: e.target.value })}>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("groupFieldCapacity")}</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-outline">
                  {tc("cancel")}
                </button>
                <button onClick={handleCreate} disabled={saving} className="btn-primary disabled:opacity-70">
                  {saving ? t("saving") : t("createGroupCta")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

// useSearchParams() isn't known at build time, so Next.js requires a
// Suspense boundary around it to keep this route statically prerenderable.
// null is the same fallback the page already shows itself while !ready.
export default function TeacherGroupsPage() {
  return (
    <Suspense fallback={null}>
      <TeacherGroupsPageInner />
    </Suspense>
  );
}
