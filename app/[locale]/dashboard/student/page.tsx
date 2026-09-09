"use client";

import { useLocale, useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useStudentNav } from "@/components/dashboard/studentNav";
import BookingCalendar from "@/components/dashboard/BookingCalendar";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { useBookings } from "@/lib/useBookings";
import { homework, HomeworkItem } from "@/data/dashboard";
import { localize } from "@/lib/localize";
import { IconTask, IconTrophy, IconShield } from "@/components/icons";

const TYPE_KEYS: Record<HomeworkItem["type"], "typeRecitation" | "typeReview" | "typeTajweed"> = {
  تسميع: "typeRecitation",
  مراجعة: "typeReview",
  تجويد: "typeTajweed",
};

function ProgressRing({ percent }: { percent: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#EDE3CD" strokeWidth="9" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#C89B4A"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        style={{ transform: "rotate(90deg)", transformOrigin: "50px 50px", fill: "#2E2418", fontSize: "18px", fontWeight: 800 }}
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function StudentDashboardPage() {
  const { upcoming } = useBookings();
  const nextLesson = upcoming[0];
  const studentNav = useStudentNav();
  const locale = useLocale();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const studentName = tc("studentName");
  const studentTitle = tc("studentTitle");
  const recentHomework = homework.slice(0, 2).map((h) => localize(h, locale));

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{t("greeting", { name: studentName })}</h1>
          <p className="text-sm text-ink-soft">{t("homeSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card flex flex-col items-center gap-3 p-6 text-center">
            <span className="text-sm font-bold text-ink-soft">{t("memorizationProgress")}</span>
            <ProgressRing percent={68} />
            <span className="text-xs text-ink-soft">{t("progressEncouragement")}</span>
          </div>

          <div className="card flex flex-col gap-3 p-6">
            <span className="text-sm font-bold text-ink-soft">{t("lastLesson")}</span>
            <h3 className="text-lg font-extrabold text-ink">{t("lastLessonSurah")}</h3>
            <p className="text-xs text-ink-soft">{t("lastLessonRange")}</p>
            <span className="mt-auto w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
              {tc("with")} {tc("teacherName")}
            </span>
          </div>

          <div className="card flex flex-col gap-3 p-6">
            <span className="text-sm font-bold text-ink-soft">{t("nextSession")}</span>
            {nextLesson ? (
              <>
                <h3 className="text-lg font-extrabold text-ink">{nextLesson.date}</h3>
                <p className="text-xs text-ink-soft">{tc("at")} {nextLesson.time}</p>
                <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                  {tc("with")} {nextLesson.teacher}
                </span>
                <JoinMeetingButton
                  room={nextLesson.id}
                  displayName={studentName}
                  subject={t("sessionSubject")}
                  className="mt-auto w-full justify-center"
                />
              </>
            ) : (
              <p className="text-sm text-ink-soft">{t("noUpcoming")}</p>
            )}
          </div>
        </div>

        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light">
              <IconShield className="h-5 w-5 text-gold-dark" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-ink">{t("directTitle")}</h3>
              <p className="text-sm text-ink-soft">{t("directDesc")}</p>
            </div>
          </div>
          <JoinMeetingButton
            room="teacher-abdullah-alsalmi"
            displayName={studentName}
            subject={t("directSubject")}
            label={t("directCta")}
            className="shrink-0 justify-center"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <BookingCalendar />

          <div className="flex flex-col gap-6">
            <div className="card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-ink">
                <IconTask className="h-5 w-5 text-gold-dark" />
                {t("myHomework")}
              </h3>
              <ul className="flex flex-col gap-3">
                {recentHomework.map((h) => (
                  <li key={h.id} className="rounded-2xl border border-line bg-bg p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="badge">{tStatus(TYPE_KEYS[h.type])}</span>
                      <span className="text-xs text-ink-soft">{tc("until")} {h.dueDate}</span>
                    </div>
                    <p className="text-sm font-bold text-ink">{h.title}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card flex flex-col items-center gap-3 p-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
                <IconTrophy className="h-7 w-7 text-gold-dark" />
              </span>
              <p className="text-sm font-bold text-ink">{t("badgesCta")}</p>
              <span className="text-xs text-ink-soft">{t("badgesCount")}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
