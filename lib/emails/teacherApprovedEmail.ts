const COLORS = {
  bg: "#FBF7EE",
  card: "#FFFFFF",
  goldDark: "#A97F32",
  ink: "#2E2418",
  inkSoft: "#7F7567",
  line: "#EDE3CD",
};

export type TeacherApprovedPayload = {
  name: string;
  profileUrl: string;
};

export function buildTeacherApprovedEmail({ name, profileUrl }: TeacherApprovedPayload) {
  const subject = "تهانينا! تم قبول طلب انضمامك كمعلم في متقن";

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
                <span style="display:inline-block;font-size:13px;font-weight:700;color:${COLORS.goldDark};">متقن — مقرأة القرآن الكريم</span>
              </td>
            </tr>
            <tr>
              <td dir="rtl" align="right" style="padding:0 32px 16px;">
                <h1 style="margin:0;font-size:20px;line-height:1.5;color:${COLORS.ink};">تهانينا يا أستاذ ${name}! 🎉</h1>
              </td>
            </tr>
            <tr>
              <td dir="rtl" align="right" style="padding:0 32px 20px;">
                <p style="margin:0 0 12px;font-size:14px;line-height:1.8;color:${COLORS.inkSoft};">
                  يسعدنا إخبارك بأنه تم قبول طلب انضمامك كمعلم في منصة متقن. ملفك الشخصي أصبح الآن منشورًا على الموقع.
                </p>
                <p style="margin:0;font-size:14px;line-height:1.8;color:${COLORS.inkSoft};">
                  سيتواصل معك فريقنا قريبًا عبر الهاتف أو البريد لإكمال باقي التفاصيل (الجدول والحصص). نرحب بك ضمن نخبة معلمي متقن، ونسأل الله أن يبارك في جهودك في تعليم كتابه الكريم.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 32px 28px;">
                <a href="${profileUrl}" style="display:inline-block;background:${COLORS.goldDark};color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:9999px;">عرض ملفك الشخصي على الموقع</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${COLORS.line};padding:18px 32px;" dir="rtl" align="right">
                <p style="margin:0;font-size:12px;color:${COLORS.inkSoft};">هذه رسالة تلقائية من منصة متقن. لأي استفسار، يمكنك الرد مباشرة على هذا البريد.</p>
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
