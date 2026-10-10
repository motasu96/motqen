import { CertificateRow, GRADE_LABEL_TEXT } from "./examsCertificates";
import {
  amountShort,
  blessingPhrase,
  certificateTitle,
  courseTitle,
  gregorianDate,
  hijriDate,
  studentPhrases,
  teacherLabel,
} from "./certificateFormat";
import { programs } from "./programs";

const SITE_URL = "https://www.motqen.site";
const INK = "#1F1C17";
const MUTED = "#8A8478";
const MUTED2 = "#6F6A60";
const BODY = "#3A362F";
const SUBTLE = "#4A453C";
const BORDER = "#E6DAC6";
const GOLD = "#A67C45";
const GOLD_DARK = "#7A5A2E";

// Builds the same certificate layout as components/CertificateTemplate.tsx
// on the web app, as a standalone HTML document for expo-print to turn
// into a PDF. Images (logo, director's signature, QR code) are loaded from
// the live website over the network — same assumption the web version
// already makes when it embeds the logo/signature from /public.
export function buildCertificateHtml(cert: CertificateRow): string {
  const g = studentPhrases(cert.student_gender);
  const program = programs.find((p) => p.slug === cert.program_slug);
  const programTitle = program?.title ?? "—";
  const gradeLabelText = cert.grade_label ? GRADE_LABEL_TEXT[cert.grade_label] : undefined;
  const gradeCell = gradeLabelText ?? (cert.grade_percent != null ? `${cert.grade_percent}%` : "—");
  const isCourse = cert.scope === "course";
  const courseName = isCourse ? courseTitle(cert.program_slug, cert.course_slug) || "—" : "";
  const eyebrow =
    cert.scope === "course"
      ? "CERTIFICATE OF COURSE COMPLETION"
      : cert.scope === "khatm"
      ? "CERTIFICATE OF QURAN COMPLETION"
      : "CERTIFICATE OF QURAN MEMORIZATION";
  const bodyText = isCourse
    ? `قد ${g.completed} دورة «${escapeHtml(courseName)}» ضمن برنامج «${escapeHtml(programTitle)}»، ${g.passed} الاختبار النهائي بنجاح، سائلين الله ${blessingPhrase(cert.student_gender)}.`
    : `قد ${g.completed} حفظ ما يلي من كتاب الله تعالى، ${g.passed} الاختبار النهائي بنجاح، سائلين الله ${blessingPhrase(cert.student_gender)}.`;
  const statCells = isCourse
    ? [
        { label: "البرنامج", en: "Program", value: programTitle, gold: false },
        { label: "الدورة", en: "Course", value: courseName, gold: false },
        { label: "التقدير", en: "Grade", value: gradeCell, gold: true },
      ]
    : [
        { label: "البرنامج", en: "Program", value: programTitle, gold: false },
        { label: "المقدار", en: "Portion", value: amountShort(cert.scope, cert.juz_count), gold: false },
        { label: "الرواية", en: "Narration", value: cert.narration, gold: false },
        { label: "التقدير", en: "Grade", value: gradeCell, gold: true },
      ];
  const statsHtml = statCells
    .map(
      (c) => `<div class="stat">
          <div class="stat-label">${c.label} · <span style="direction:ltr">${c.en}</span></div>
          <div class="stat-value${c.gold ? " gold" : ""}">${escapeHtml(c.value)}</div>
        </div>`
    )
    .join("\n        ");
  const verifyUrl = `${SITE_URL}/verify/${cert.certificate_number}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(verifyUrl)}`;

  return `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
  .page {
    position: relative;
    width: 1123px;
    height: 794px;
    overflow: hidden;
    background: #FFFFFF;
    color: ${INK};
    font-family: "IBM Plex Sans Arabic", sans-serif;
  }
  .frame { position: absolute; inset: 24px; border: 1px solid ${BORDER}; }
  .bar { position: absolute; top: 24px; left: 50%; width: 120px; height: 3px; margin-left: -60px; background: ${GOLD}; }
  .content {
    position: absolute;
    inset: 48px 72px 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .logo { height: 62px; width: auto; }
  .eyebrow { margin-top: 22px; font-size: 13px; letter-spacing: 0.34em; text-transform: uppercase; color: ${GOLD}; direction: ltr; }
  h1 { margin: 4px 0 0; font-family: "Amiri", serif; font-weight: 700; font-size: 54px; line-height: 1.2; }
  .intro { margin-top: 14px; display: flex; flex-direction: column; gap: 2px; }
  .intro-ar { font-size: 17px; color: ${SUBTLE}; }
  .intro-en { font-size: 14px; color: ${MUTED}; font-style: italic; direction: ltr; }
  .student-name { margin-top: 8px; font-family: "Amiri", serif; font-weight: 700; font-size: 44px; line-height: 1.3; color: ${GOLD_DARK}; }
  .body-text { margin: 14px 0 0; max-width: 680px; font-size: 17px; line-height: 1.8; color: ${BODY}; }
  .stats {
    margin-top: 20px;
    width: 100%;
    max-width: 860px;
    display: grid;
    grid-template-columns: repeat(${statCells.length}, minmax(0, 1fr));
    border-top: 1px solid ${BORDER};
    border-bottom: 1px solid ${BORDER};
  }
  .stat { padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid ${BORDER}; }
  .stat:first-child { border-right: none; }
  .stat-label { font-size: 13px; color: ${MUTED}; }
  .stat-value { font-size: 18px; font-weight: 600; }
  .stat-value.gold { color: ${GOLD_DARK}; }
  .juz-names { margin-top: 10px; max-width: 780px; font-size: 14px; color: ${SUBTLE}; line-height: 1.6; }
  .juz-names .label { color: ${MUTED}; font-weight: 600; }
  .hadith { margin-top: 14px; font-family: "Amiri", serif; font-size: 18px; color: ${GOLD}; }
  .hadith .source { font-size: 14px; color: ${MUTED}; }
  .footer {
    margin-top: auto;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1.2fr auto 1.2fr 1fr;
    align-items: end;
    gap: 20px;
    text-align: right;
  }
  .footer-col { display: flex; flex-direction: column; gap: 3px; font-size: 13px; color: ${MUTED2}; }
  .cert-number { direction: ltr; text-align: right; font-weight: 600; color: ${INK}; letter-spacing: 0.04em; }
  .signature-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .signature-spacer { height: 38px; }
  .signature-line { width: 100%; height: 1px; background: ${INK}; }
  .signature-label { font-size: 13px; color: ${MUTED}; }
  .signature-name { font-size: 15px; font-weight: 600; }
  .seal { width: 112px; height: 112px; border-radius: 50%; border: 1px solid ${GOLD}; display: grid; place-items: center; }
  .seal img { width: 94px; height: 94px; border-radius: 50%; object-fit: cover; }
  .qr-col { justify-self: end; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .qr-box { width: 78px; height: 78px; border: 1px solid ${BORDER}; display: grid; place-items: center; background: #F4EFE6; }
  .qr-box img { width: 100%; height: 100%; }
  .qr-url { direction: ltr; font-size: 12px; color: ${GOLD}; }
</style>
</head>
<body>
  <div class="page">
    <div class="frame"></div>
    <div class="bar"></div>
    <div class="content">
      <img class="logo" src="${SITE_URL}/images/logo.png" />

      <div class="eyebrow">${eyebrow}</div>
      <h1>${certificateTitle(cert.scope)}</h1>

      <div class="intro">
        <div class="intro-ar">تشهد مقرأة متقن بأنّ ${g.student}</div>
        <div class="intro-en">This is to certify that</div>
      </div>

      <div class="student-name">${escapeHtml(cert.student_name)}</div>

      <p class="body-text">${bodyText}</p>

      <div class="stats">
        ${statsHtml}
      </div>

      ${
        cert.juz_names
          ? `<div class="juz-names"><span class="label">الأجزاء المحفوظة · <span style="direction:ltr">Memorized Juz'</span>: </span>${escapeHtml(cert.juz_names)}</div>`
          : ""
      }

      <div class="hadith">«خيركم من تعلّم القرآن وعلّمه» <span class="source">رواه البخاري</span></div>

      <div class="footer">
        <div class="footer-col">
          <div>رقم الشهادة</div>
          <div class="cert-number">${escapeHtml(cert.certificate_number)}</div>
          <div style="margin-top:6px">${hijriDate(cert.issued_at)}</div>
          <div style="direction:ltr;text-align:right">${gregorianDate(cert.issued_at)}</div>
        </div>

        <div class="signature-col">
          <div class="signature-spacer"></div>
          <div class="signature-line"></div>
          <div class="signature-label">${teacherLabel(cert.teacher_gender)} · <span style="direction:ltr">Teacher</span></div>
          <div class="signature-name">${escapeHtml(cert.teacher_name)}</div>
        </div>

        <div class="seal">
          <img src="${SITE_URL}/icon.png" />
        </div>

        <div class="signature-col">
          <div class="signature-spacer" style="display:flex;align-items:flex-end;justify-content:center">
            <img src="${SITE_URL}/images/director-signature.png" style="height:40px;width:auto;object-fit:contain" />
          </div>
          <div class="signature-line"></div>
          <div class="signature-label">مدير المقرأة · <span style="direction:ltr">Director</span></div>
          <div class="signature-name">${escapeHtml(cert.issued_by_name)}</div>
        </div>

        <div class="qr-col">
          <div class="qr-box"><img src="${qrUrl}" /></div>
          <div class="qr-url">motqen.site/verify</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
