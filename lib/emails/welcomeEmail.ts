const SITE_URL = "https://www.motqen.site";
const LOGO_URL = `${SITE_URL}/icon.png`;

const COLORS = {
  bg: "#FBF7EE",
  card: "#FFFFFF",
  gold: "#C89B4A",
  goldDark: "#A97F32",
  ink: "#2E2418",
  inkSoft: "#7F7567",
  line: "#EDE3CD",
};

export function buildWelcomeEmail(name: string, locale: "ar" | "en") {
  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const align = isArabic ? "right" : "left";

  const subject = isArabic ? "مرحبًا بك في متقن" : "Welcome to Motqen";
  const preheader = isArabic
    ? "تم تأكيد تسجيلك بنجاح — ابدأ رحلتك في تعلم القرآن الكريم."
    : "Your registration is confirmed — start your Quran learning journey.";
  const eyebrow = isArabic ? "مرحبًا بك" : "Welcome";
  const greeting = isArabic ? `أهلًا ${name}،` : `Hi ${name},`;
  const body = isArabic
    ? "تم تأكيد تسجيلك بنجاح في مقرأة متقن. فريقنا من المعلمين والمعلمات المجازين جاهز لمرافقتك في رحلة تعلم القرآن الكريم بإتقان وتدبر."
    : "Your registration with Motqen Quran Academy has been confirmed. Our team of certified teachers is ready to accompany you on your journey of learning the Holy Quran with mastery and reflection.";
  const ctaLabel = isArabic ? "الذهاب إلى لوحتي" : "Go to my dashboard";
  const ctaUrl = isArabic ? `${SITE_URL}/dashboard/student` : `${SITE_URL}/en/dashboard/student`;
  const footerRights = isArabic ? "جميع الحقوق محفوظة" : "All rights reserved";
  const footerContact = isArabic ? "بحاجة لمساعدة؟ راسلنا على" : "Need help? Email us at";

  const html = `<!doctype html>
<html dir="${dir}" lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:${COLORS.card};border-radius:20px;border:1px solid ${COLORS.line};overflow:hidden;">
            <tr>
              <td align="center" style="padding:32px 32px 16px;">
                <img src="${LOGO_URL}" alt="Motqen" width="56" height="56" style="display:block;border-radius:50%;" />
              </td>
            </tr>
            <tr>
              <td align="${align}" dir="${dir}" style="padding:0 36px 8px;">
                <span style="display:inline-block;font-size:13px;font-weight:700;color:${COLORS.goldDark};">${eyebrow}</span>
              </td>
            </tr>
            <tr>
              <td align="${align}" dir="${dir}" style="padding:0 36px 12px;">
                <h1 style="margin:0;font-size:22px;line-height:1.4;color:${COLORS.ink};">${greeting}</h1>
              </td>
            </tr>
            <tr>
              <td align="${align}" dir="${dir}" style="padding:0 36px 28px;">
                <p style="margin:0;font-size:15px;line-height:1.8;color:${COLORS.inkSoft};">${body}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 36px 36px;">
                <a href="${ctaUrl}" style="display:inline-block;background-color:${COLORS.goldDark};color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;">${ctaLabel}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${COLORS.line};padding:20px 36px;" align="center">
                <p style="margin:0 0 4px;font-size:12px;color:${COLORS.inkSoft};">© ${new Date().getFullYear()} Motqen — ${footerRights}</p>
                <p style="margin:0;font-size:12px;color:${COLORS.inkSoft};" dir="ltr">${footerContact} info@motqen.site</p>
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
