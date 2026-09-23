"use client";

import { useEffect, useState } from "react";
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
  listGroupAttendanceDates,
  saveGroupAttendance,
  StudentAttendance,
} from "@/lib/supabase/groupAttendance";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { useToast } from "@/components/Toast";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { IconCalendar, IconClock, IconFamily, IconX } from "@/components/icons";

type FormState = { title: string; titleEn: string; programSlug: string; dayOfWeek: number; sessionTime: string; capacity: string };

function emptyForm(defaultTime: string): FormState {
  return { title: "", titleEn: "", programSlug: programs[0]?.slug ?? "", dayOfWeek: 0, sessionTime: defaultTime, capacity: "6" };
}

function GroupAttendancePanel({ group, teacherId, onClose }: { group: GroupWithMembers; teacherId: string; onClose: () => void }) {
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const { showToast } = useToast();
  const todayIso = new Date().toISOString().slice(0, 10);

  const [sessionDate, setSessionDate] = useState(todayIso);
  const [records, setRecords] = useState<Map<string, StudentAttendance>>(new Map());
  const [loggedDates, setLoggedDates] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadForDate(date: string) {
    setReady(false);
    const existing = await getGroupAttendanceForDate(createClient(), group.id, date);
    const merged = new Map<string, StudentAttendance>();
    for (const m of group.enrolledMembers) {
      merged.set(m.id, existing.get(m.id) ?? { attended: true, notes: "" });
    }
    setRecords(merged);
    setReady(true);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const dates = await listGroupAttendanceDates(createClient(), group.id);
      if (cancelled) return;
      setLoggedDates(dates);
      await loadForDate(todayIso);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  async function selectDate(date: string) {
    setSessionDate(date);
    await loadForDate(date);
  }

  function toggle(studentId: string, attended: boolean) {
    setRecords((prev) => {
      const next = new Map(prev);
      const cur = next.get(studentId) ?? { attended: true, notes: "" };
      next.set(studentId, { ...cur, attended });
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const ok = await saveGroupAttendance(createClient(), {
      groupId: group.id,
      teacherId,
      sessionDate,
      records: group.enrolledMembers.map((m) => ({
        studentId: m.id,
        attended: records.get(m.id)?.attended ?? true,
        notes: records.get(m.id)?.notes ?? "",
      })),
    });
    setSaving(false);
    if (!ok) {
      showToast(t("errorAttendanceSave"), "error");
      return;
    }
    showToast(t("toastAttendanceSaved"), "success");
    setLoggedDates((prev) => (prev.includes(sessionDate) ? prev : [...prev, sessionDate].sort().reverse()));
  }

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
          onChange={(e) => selectDate(e.target.value)}
          className="input w-48 py-2 text-xs"
        />
      </div>

      {group.enrolledMembers.length === 0 ? (
        <p className="text-sm text-ink-soft">{t("noMembersForAttendance")}</p>
      ) : !ready ? null : (
        <div className="flex flex-col gap-2">
          {group.enrolledMembers.map((m) => {
            const rec = records.get(m.id) ?? { attended: true, notes: "" };
            return (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg px-4 py-2.5">
                <span className="text-sm font-bold text-ink">{m.name}</span>
                <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-card p-1">
                  <button
                    type="button"
                    onClick={() => toggle(m.id, true)}
                    aria-pressed={rec.attended}
                    className={`rounded-pill px-3 py-1 text-xs font-bold transition-colors ${rec.attended ? "bg-gold-gradient text-white" : "text-ink-soft"}`}
                  >
                    {t("attendedCta")}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(m.id, false)}
                    aria-pressed={!rec.attended}
                    className={`rounded-pill px-3 py-1 text-xs font-bold transition-colors ${!rec.attended ? "bg-red-500 text-white" : "text-ink-soft"}`}
                  >
                    {t("absentCta")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || group.enrolledMembers.length === 0}
        className="btn-primary w-fit disabled:opacity-70"
      >
        {saving ? t("saving") : t("attendanceSaveCta")}
      </button>

      {loggedDates.length > 0 && (
        <div className="border-t border-line pt-3">
          <h5 className="mb-2 text-xs font-extrabold text-ink-soft">{t("attendanceHistoryTitle")}</h5>
          <div className="flex flex-wrap gap-2">
            {loggedDates.map((d) => (
              <button
                key={d}
                onClick={() => selectDate(d)}
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

export default function TeacherGroupsPage() {
  const teacherNav = useTeacherNav();
  const handleLogout = useTeacherLogout();
  const { name: teacherName, title: teacherTitle } = useTeacherProfile();
  const locale = useLocale();
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const { showToast } = useToast();
  const dayLabels = tc.raw("weekDaysSaturdayFirst") as string[];
  const timeSlots = tc.raw("timeSlots") as string[];
  const searchParams = useSearchParams();
  const openLogId = searchParams.get("openLog");

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [ready, setReady] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [openAttendanceGroupId, setOpenAttendanceGroupId] = useState<string | null>(openLogId);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(timeSlots[0] ?? ""));
  const [saving, setSaving] = useState(false);

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
    <DashboardShell navItems={teacherNav} userName={teacherName} userSubtitle={teacherTitle} onLogout={handleLogout}>
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
                      <span className="badge mb-1.5 w-fit">{programTitle}</span>
                      <h3 className="text-base font-extrabold leading-snug text-ink">{title}</h3>
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
                  <GroupAttendancePanel group={g} teacherId={teacherId} onClose={() => setOpenAttendanceGroupId(null)} />
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
                <select className="input" value={form.programSlug} onChange={(e) => setForm({ ...form, programSlug: e.target.value })}>
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
