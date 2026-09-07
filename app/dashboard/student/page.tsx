"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { studentNav } from "@/components/dashboard/studentNav";
import BookingCalendar from "@/components/dashboard/BookingCalendar";
import JoinMeetingButton from "@/components/dashboard/JoinMeetingButton";
import { useBookings } from "@/lib/useBookings";
import { IconTask, IconTrophy } from "@/components/icons";

const HOMEWORK = [
  { title: "تسميع الآيات 120 إلى 145", type: "تسميع", due: "24 مايو 2026" },
  { title: "مراجعة سورة البقرة من 100 إلى 120", type: "مراجعة", due: "26 مايو 2026" },
];

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

  return (
    <DashboardShell navItems={studentNav} userName="أحمد محمد" userSubtitle="طالب في برنامج الحفظ المتقن">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">مرحبًا، أحمد محمد 👋</h1>
          <p className="text-sm text-ink-soft">طالب في برنامج الحفظ المتقن — استمر، أنت تتقدم بشكل ممتاز</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card flex flex-col items-center gap-3 p-6 text-center">
            <span className="text-sm font-bold text-ink-soft">نسبة إنجاز الحفظ</span>
            <ProgressRing percent={68} />
            <span className="text-xs text-ink-soft">أنت تتقدم بشكل ممتاز!</span>
          </div>

          <div className="card flex flex-col gap-3 p-6">
            <span className="text-sm font-bold text-ink-soft">آخر درس</span>
            <h3 className="text-lg font-extrabold text-ink">سورة البقرة</h3>
            <p className="text-xs text-ink-soft">من الآية 120 إلى 145</p>
            <span className="mt-auto w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
              مع أ. عبدالله السلمي
            </span>
          </div>

          <div className="card flex flex-col gap-3 p-6">
            <span className="text-sm font-bold text-ink-soft">حصتك القادمة</span>
            {nextLesson ? (
              <>
                <h3 className="text-lg font-extrabold text-ink">{nextLesson.date}</h3>
                <p className="text-xs text-ink-soft">الساعة {nextLesson.time}</p>
                <span className="w-fit rounded-pill bg-gold-light px-3 py-1 text-xs font-bold text-gold-dark">
                  مع {nextLesson.teacher}
                </span>
                <JoinMeetingButton url={nextLesson.meetingUrl} className="mt-auto w-full justify-center" />
              </>
            ) : (
              <p className="text-sm text-ink-soft">لا توجد حصص قادمة، احجز موعدك الآن.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <BookingCalendar />

          <div className="flex flex-col gap-6">
            <div className="card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-ink">
                <IconTask className="h-5 w-5 text-gold-dark" />
                واجباتي
              </h3>
              <ul className="flex flex-col gap-3">
                {HOMEWORK.map((h) => (
                  <li key={h.title} className="rounded-2xl border border-line bg-bg p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="badge">{h.type}</span>
                      <span className="text-xs text-ink-soft">حتى {h.due}</span>
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
              <p className="text-sm font-bold text-ink">احفظ وتقدّم لتحصل على شارات أكثر</p>
              <span className="text-xs text-ink-soft">حصلت على 3 شارات هذا الشهر</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
