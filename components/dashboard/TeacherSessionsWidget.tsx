"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getMyTeacherId } from "@/lib/supabase/teacherStudents";
import { listTeacherBookings, TeacherBooking } from "@/lib/supabase/bookings";
import { LessonRow, createLesson, listTeacherLessonsByBooking, updateLesson } from "@/lib/supabase/lessons";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { useToast } from "@/components/Toast";
import { IconCalendar, IconClock } from "@/components/icons";

function LogLessonForm({
  booking,
  teacherId,
  lesson,
  onSaved,
  onCancel,
}: {
  booking: TeacherBooking;
  teacherId: string;
  lesson?: LessonRow;
  onSaved: (bookingId: string, lesson: LessonRow) => void;
  onCancel?: () => void;
}) {
  const t = useTranslations("Dashboard.teacher");
  const { showToast } = useToast();
  const [open, setOpen] = useState(Boolean(lesson));
  const [attended, setAttended] = useState(lesson?.attended ?? true);
  const [surah, setSurah] = useState(lesson?.surah ?? "");
  const [range, setRange] = useState(lesson?.ayah_range ?? "");
  const [notes, setNotes] = useState(lesson?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (attended && (!surah.trim() || !range.trim())) {
      showToast(t("errorLessonFields"), "error");
      return;
    }
    setSaving(true);
    const params = { attended, surah: surah.trim(), ayahRange: range.trim(), notes: notes.trim() };
    const ok = lesson
      ? await updateLesson(createClient(), lesson.id, params)
      : await createLesson(createClient(), { bookingId: booking.id, studentId: booking.studentId, teacherId, sessionDate: booking.date, ...params });
    setSaving(false);
    if (!ok) {
      showToast(t("errorLessonSave"), "error");
      return;
    }
    showToast(lesson ? t("toastLessonUpdated") : t("toastLessonLogged"), "success");
    onSaved(booking.id, {
      id: lesson?.id ?? booking.id,
      booking_id: booking.id,
      student_id: booking.studentId,
      teacher_id: teacherId,
      session_date: booking.date,
      attended,
      surah: attended ? surah.trim() : null,
      ayah_range: attended ? range.trim() : null,
      notes: notes.trim() || null,
      created_at: lesson?.created_at ?? new Date().toISOString(),
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline px-4 py-2 text-xs">
        {t("logLessonCta")}
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-64">
      <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-card p-1">
        <button
          type="button"
          onClick={() => setAttended(true)}
          aria-pressed={attended}
          className={`rounded-pill py-1.5 text-xs font-bold transition-colors ${attended ? "bg-gold-gradient text-white" : "text-ink-soft"}`}
        >
          {t("attendedCta")}
        </button>
        <button
          type="button"
          onClick={() => setAttended(false)}
          aria-pressed={!attended}
          className={`rounded-pill py-1.5 text-xs font-bold transition-colors ${!attended ? "bg-red-500 text-white" : "text-ink-soft"}`}
        >
          {t("absentCta")}
        </button>
      </div>
      {attended && (
        <>
          <input
            value={surah}
            onChange={(e) => setSurah(e.target.value)}
            placeholder={t("lessonSurahPlaceholder")}
            className="input py-2 text-xs"
          />
          <input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder={t("lessonRangePlaceholder")}
            className="input py-2 text-xs"
          />
        </>
      )}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("lessonNotesPlaceholder")}
        rows={2}
        className="input resize-none py-2 text-xs"
      />
      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-4 py-2 text-xs disabled:opacity-70">
          {t("saveLessonCta")}
        </button>
        <button onClick={onCancel ?? (() => setOpen(false))} className="text-xs font-bold text-ink-soft hover:text-gold-dark">
          {t("cancelLessonCta")}
        </button>
      </div>
    </div>
  );
}

function LoggedSessionRow({
  booking,
  teacherId,
  lesson,
  onSaved,
}: {
  booking: TeacherBooking;
  teacherId: string;
  lesson: LessonRow;
  onSaved: (bookingId: string, lesson: LessonRow) => void;
}) {
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const [editing, setEditing] = useState(false);

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="text-sm font-bold text-ink">{booking.date} — {booking.time}</div>
        <div className="text-xs text-ink-soft">{tc("with")} {booking.studentName}</div>
      </div>
      {editing ? (
        <LogLessonForm
          booking={booking}
          teacherId={teacherId}
          lesson={lesson}
          onSaved={(bookingId, l) => {
            onSaved(bookingId, l);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="flex items-center gap-3">
          <span
            className={`rounded-pill px-3 py-1 text-xs font-bold ${
              lesson.attended
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400"
            }`}
          >
            {lesson.attended ? t("attendedCta") : t("absentCta")}
          </span>
          <button onClick={() => setEditing(true)} className="text-xs font-bold text-ink-soft transition-colors hover:text-gold-dark">
            {tc("edit")}
          </button>
        </div>
      )}
    </li>
  );
}

export default function TeacherSessionsWidget({ displayName }: { displayName: string }) {
  const t = useTranslations("Dashboard.teacher");
  const tc = useTranslations("Dashboard.common");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [lessonsByBooking, setLessonsByBooking] = useState<Map<string, LessonRow>>(new Map());
  const [ready, setReady] = useState(false);

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
      const [rows, lessons] = await Promise.all([listTeacherBookings(supabase, tId), listTeacherLessonsByBooking(supabase, tId)]);
      if (cancelled) return;
      setTeacherId(tId);
      setBookings(rows);
      setLessonsByBooking(lessons);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !teacherId) return null;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today);
  const past = bookings.filter((b) => b.date < today);
  const needsLogging = past.filter((b) => !lessonsByBooking.has(b.id));
  const loggedSessions = past.filter((b) => lessonsByBooking.has(b.id));

  function handleSaved(bookingId: string, lesson: LessonRow) {
    setLessonsByBooking((prev) => new Map(prev).set(bookingId, lesson));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-4 p-6">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
          <IconCalendar className="h-5 w-5 text-gold-dark" />
          {t("upcomingSessionsTitle")}
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("noSessions")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((b) => (
              <li key={b.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light">
                    <IconClock className="h-4 w-4 text-gold-dark" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-ink">{b.date} — {b.time}</div>
                    <div className="text-xs text-ink-soft">{tc("with")} {b.studentName}</div>
                  </div>
                </div>
                <JoinMeetingButton room={b.id} displayName={displayName} subject={t("sessionSubject")} label={t("startSessionCta")} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {needsLogging.length > 0 && (
        <div className="card flex flex-col gap-4 p-6">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <IconClock className="h-5 w-5 text-gold-dark" />
            {t("sessionsToLogTitle")}
          </h3>
          <ul className="flex flex-col gap-3">
            {needsLogging.map((b) => (
              <li key={b.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">{b.date} — {b.time}</div>
                  <div className="text-xs text-ink-soft">{tc("with")} {b.studentName}</div>
                </div>
                <LogLessonForm booking={b} teacherId={teacherId} onSaved={handleSaved} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {loggedSessions.length > 0 && (
        <div className="card flex flex-col gap-4 p-6">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <IconClock className="h-5 w-5 text-gold-dark" />
            {t("loggedSessionsTitle")}
          </h3>
          <ul className="flex flex-col gap-3">
            {loggedSessions.map((b) => (
              <LoggedSessionRow
                key={b.id}
                booking={b}
                teacherId={teacherId}
                lesson={lessonsByBooking.get(b.id)!}
                onSaved={handleSaved}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
