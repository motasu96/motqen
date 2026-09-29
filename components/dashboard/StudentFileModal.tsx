"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { getStudentFileProfile, StudentFileProfile } from "@/lib/supabase/students";
import { getCountryByIso } from "@/data/countries";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import { IconFolder, IconX } from "@/components/icons";

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}

export default function StudentFileModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const locale = useLocale();
  const t = useTranslations("Dashboard.common");
  const dayLabels = t.raw("weekDaysSaturdayFirst") as string[];
  const [profile, setProfile] = useState<StudentFileProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getStudentFileProfile(createClient(), studentId);
      if (!cancelled) {
        setProfile(data);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const student = profile?.student ?? null;
  const country = student?.country ? getCountryByIso(student.country) : undefined;
  const program = student?.program_slug ? programs.find((p) => p.slug === student.program_slug) : undefined;
  const programTitle = program ? localize(program, locale).title : null;
  const preferredDaysLabel = (student?.preferred_days ?? [])
    .map((d) => {
      const i = Number(d);
      return Number.isInteger(i) && i >= 0 && i < dayLabels.length ? dayLabels[i] : d;
    })
    .join("، ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="animate-overlay-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="card animate-fade-up relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <IconFolder className="h-5 w-5 text-gold-dark" aria-hidden="true" />
            {t("studentFileTitle")}
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition-colors hover:text-gold-dark"
          >
            <IconX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {!ready ? (
          <p className="p-6 text-sm text-ink-soft">{t("studentFileLoading")}</p>
        ) : !student ? (
          <p className="p-6 text-sm text-ink-soft">{t("studentFileNotFound")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            <Row label={t("studentFileName")} value={profile?.fullName} />
            <Row
              label={t("studentFileGender")}
              value={student.gender === "male" ? t("studentFileGenderMale") : t("studentFileGenderFemale")}
            />
            <Row label={t("studentFileAge")} value={student.age ? String(student.age) : null} />
            <Row label={t("studentFileCountry")} value={country ? (locale === "en" ? country.nameEn : country.name) : null} />
            <Row label={t("studentFileCity")} value={student.city} />
            <Row label={t("studentFilePhone")} value={profile?.phone} />
            <Row label={t("studentFileEmail")} value={student.email} />
            <Row label={t("studentFileProgram")} value={programTitle} />
            <Row label={t("studentFilePreferredDays")} value={preferredDaysLabel || null} />
            <Row label={t("studentFilePreferredTime")} value={student.preferred_time} />
            <Row label={t("studentFilePreferredTeacher")} value={profile?.preferredTeacherName} />
            {student.plan_duration_months && (
              <>
                <Row
                  label={t("studentFilePlanDuration")}
                  value={t("studentFileMonths", { count: student.plan_duration_months })}
                />
                <Row label={t("studentFileAlreadyMemorized")} value={String(student.already_memorized_juz)} />
                <Row label={t("studentFileReviewDays")} value={student.review_days_per_week ? String(student.review_days_per_week) : null} />
                <Row
                  label={t("studentFileDirection")}
                  value={
                    student.plan_direction === "fromStart"
                      ? t("studentFileDirectionFromStart")
                      : student.plan_direction === "fromEnd"
                      ? t("studentFileDirectionFromEnd")
                      : null
                  }
                />
              </>
            )}
            <Row label={t("studentFileJoinDate")} value={student.created_at?.slice(0, 10)} />
          </div>
        )}
      </div>
    </div>
  );
}
