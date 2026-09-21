const COLORS = {
  bg: "#FBF7EE",
  card: "#FFFFFF",
  goldDark: "#A97F32",
  ink: "#2E2418",
  inkSoft: "#7F7567",
  line: "#EDE3CD",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type TeacherApplicationPayload = {
  name: string;
  phone: string;
  email: string;
  gender: "male" | "female";
  specialties: string[];
  yearsExperience: string;
  ijazah: string;
  bio: string;
};

export function buildTeacherApplicationEmail({
  name,
  phone,
  email,
  gender,
  specialties,
  yearsExperience,
  ijazah,
  bio,
}: TeacherApplicationPayload) {
  const subject = `طلب انضمام معلم جديد — ${name}`;

  const row = (label: string, value: string) => `
    <tr>
      <td dir="rtl" align="right" style="padding:12px 0;border-bottom:1px solid ${COLORS.line};">
        <span style="display:block;font-size:12px;color:${COLORS.inkSoft};margin-bottom:3px;">${escapeHtml(label)}</span>
        <span style="display:block;font-size:14px;font-weight:700;color:${COLORS.ink};white-space:pre-wrap;">${escapeHtml(value)}</span>
      </td>
    </tr>`;

  const html = `<!doctype html>
<html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:${COLORS.card};border-radius:20px;border:1px solid ${COLORS.line};overflow:hidden;">
            <tr>
              <td dir="rtl" align="right" style="padding:28px 32px 4px;">
                <span style="display:inline-block;font-size:13px;font-weight:700;color:${COLORS.goldDark};">طلب انضمام كمعلم</span>
              </td>
            </tr>
            <tr>
              <td dir="rtl" align="right" style="padding:0 32px 20px;">
                <h1 style="margin:0;font-size:20px;line-height:1.4;color:${COLORS.ink};">طلب انضمام معلم جديد</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("الاسم", name)}
                  ${row("رقم الجوال", phone)}
                  ${row("البريد الإلكتروني", email)}
                  ${row("الجنس", gender === "male" ? "ذكر" : "أنثى")}
                  ${row("التخصصات", specialties.length ? specialties.join("، ") : "—")}
                  ${row("سنوات الخبرة", yearsExperience || "—")}
                  ${row("الإجازات/الأسانيد", ijazah || "—")}
                  ${row("نبذة عن المتقدم", bio)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${COLORS.line};padding:18px 32px;" dir="rtl" align="right">
                <p style="margin:0;font-size:12px;color:${COLORS.inkSoft};">وصلك هذا الطلب من نموذج "انضم كمعلم" في موقع متقن — يمكنك الرد مباشرة على هذا البريد للتواصل مع المتقدم.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}
