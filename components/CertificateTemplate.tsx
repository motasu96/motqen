"use client";

import { amiri, plexArabic } from "@/lib/certificateFonts";
import { CertificateRow } from "@/lib/supabase/certificates";
import { programs } from "@/data/programs";
import { localize } from "@/lib/localize";
import {
  amountShort,
  certificateTitle,
  gregorianDate,
  hijriDate,
  studentPhrases,
  teacherLabel,
} from "@/lib/certificateFormat";

const INK = "#1F1C17";
const MUTED = "#8A8478";
const MUTED2 = "#6F6A60";
const BODY = "#3A362F";
const SUBTLE = "#4A453C";
const BORDER = "#E6DAC6";
const GOLD = "#A67C45";
const GOLD_DARK = "#7A5A2E";

export default function CertificateTemplate({
  cert,
  locale,
  qrDataUrl,
}: {
  cert: CertificateRow;
  locale: string;
  qrDataUrl: string | null;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const g = studentPhrases(cert.student_gender, locale);
  const program = programs.find((p) => p.slug === cert.program_slug);
  const programTitle = program ? localize(program, locale).title : "—";
  const gradeLabelText =
    cert.grade_label &&
    { excellent_high: "ممتاز مرتفع", excellent: "ممتاز", very_good: "جيد جدًا", good: "جيد", pass: "مقبول" }[cert.grade_label];

  return (
    <div
      dir={dir}
      lang={locale}
      className={`${amiri.variable} ${plexArabic.variable}`}
      style={{
        position: "relative",
        width: 1123,
        height: 794,
        overflow: "hidden",
        background: "#FFFFFF",
        color: INK,
        boxSizing: "border-box",
        fontFamily: "var(--font-plex-arabic), sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: 24, border: `1px solid ${BORDER}` }} />
      <div style={{ position: "absolute", top: 24, left: "50%", width: 120, height: 3, marginLeft: -60, background: GOLD }} />

      <div
        style={{
          position: "absolute",
          inset: "48px 72px 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="متقن" style={{ height: 62, width: "auto", mixBlendMode: "multiply" }} />

        <div
          dir="ltr"
          style={{ marginTop: 22, fontSize: 13, letterSpacing: "0.34em", textTransform: "uppercase", color: GOLD }}
        >
          {certificateTitle(cert.scope, "en")}
        </div>
        <h1 style={{ margin: "4px 0 0", fontFamily: "var(--font-amiri), serif", fontWeight: 700, fontSize: 54, lineHeight: 1.2 }}>
          {certificateTitle(cert.scope, "ar")}
        </h1>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 17, color: SUBTLE }}>تشهد مقرأة متقن بأنّ {g.student}</div>
          <div dir="ltr" style={{ fontSize: 14, color: MUTED, fontStyle: "italic" }}>
            This is to certify that
          </div>
        </div>

        <div style={{ marginTop: 8, fontFamily: "var(--font-amiri), serif", fontWeight: 700, fontSize: 44, lineHeight: 1.3, color: GOLD_DARK }}>
          {cert.student_name}
        </div>

        <p style={{ margin: "14px 0 0", maxWidth: 680, fontSize: 17, lineHeight: 1.8, color: BODY }}>
          قد {g.completed} حفظ ما يلي من كتاب الله تعالى، {g.passed} الاختبار النهائي بنجاح، سائلين الله أن يبارك فيه وينفع به.
        </p>

        <div
          style={{
            marginTop: 20,
            width: "100%",
            maxWidth: 860,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            borderTop: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 13, color: MUTED }}>
              البرنامج · <span dir="ltr">Program</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{programTitle}</div>
          </div>
          <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 13, color: MUTED }}>
              المقدار · <span dir="ltr">Portion</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{amountShort(cert.scope, cert.juz_count, "ar")}</div>
          </div>
          <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 13, color: MUTED }}>
              الرواية · <span dir="ltr">Narration</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{cert.narration}</div>
          </div>
          <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 13, color: MUTED }}>
              التقدير · <span dir="ltr">Grade</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: GOLD_DARK }}>
              {gradeLabelText ?? (cert.grade_percent != null ? `${cert.grade_percent}%` : "—")}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, fontFamily: "var(--font-amiri), serif", fontSize: 18, color: GOLD }}>
          «خيركم من تعلّم القرآن وعلّمه» <span style={{ fontSize: 14, color: MUTED }}>رواه البخاري</span>
        </div>

        <div
          style={{
            marginTop: "auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr auto 1.2fr 1fr",
            alignItems: "end",
            gap: 20,
            textAlign: "right",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 13, color: MUTED2 }}>
            <div>رقم الشهادة</div>
            <div dir="ltr" style={{ textAlign: "right", fontWeight: 600, color: INK, letterSpacing: "0.04em" }}>
              {cert.certificate_number}
            </div>
            <div style={{ marginTop: 6 }}>{hijriDate(cert.issued_at, "ar")}</div>
            <div dir="ltr" style={{ textAlign: "right" }}>
              {gregorianDate(cert.issued_at, "en")}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ height: 38 }} />
            <div style={{ width: "100%", height: 1, background: INK }} />
            <div style={{ fontSize: 13, color: MUTED }}>
              {teacherLabel(cert.teacher_gender, "ar")} · <span dir="ltr">Teacher</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{cert.teacher_name}</div>
          </div>

          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: "50%",
              border: `1px solid ${GOLD}`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <div style={{ width: 94, height: 94, borderRadius: "50%", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ height: 38 }} />
            <div style={{ width: "100%", height: 1, background: INK }} />
            <div style={{ fontSize: 13, color: MUTED }}>
              مدير المقرأة · <span dir="ltr">Director</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{cert.issued_by_name}</div>
          </div>

          <div style={{ justifySelf: "end", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <div
              style={{
                width: 78,
                height: 78,
                border: `1px solid ${BORDER}`,
                display: "grid",
                placeItems: "center",
                background: "#F4EFE6",
              }}
            >
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR" style={{ width: "100%", height: "100%" }} />
              ) : null}
            </div>
            <div dir="ltr" style={{ fontSize: 12, color: GOLD }}>
              motqen.site/verify
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
