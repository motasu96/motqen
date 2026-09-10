import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";
import { IconMail, IconMapPin, IconPhone } from "./icons";

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const tContact = useTranslations("Contact");
  const tSite = useTranslations("Site");

  const QUICK_LINKS = [
    { href: "/", label: tNav("home") },
    { href: "/programs", label: tNav("programs") },
    { href: "/teachers", label: tNav("teachers") },
    { href: "/articles", label: tNav("articles") },
  ];

  const HELP_LINKS = [
    { href: "/about", label: tNav("about") },
    { href: "/contact", label: tNav("contact") },
    { href: "/donate", label: tNav("donate") },
    { href: "/login", label: tNav("login") },
    { href: "/signup", label: t("signupLink") },
  ];

  return (
    <footer className="border-t border-line bg-card">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="text-sm leading-relaxed text-ink-soft">{t("description")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-extrabold text-ink">{t("quickLinks")}</h4>
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-soft hover:text-gold-dark">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-extrabold text-ink">{t("importantPages")}</h4>
          {HELP_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-soft hover:text-gold-dark">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-extrabold text-ink">{t("contactUs")}</h4>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <IconMail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            <span dir="ltr">info@motqen.site</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <IconPhone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            <span dir="ltr">+966 50 123 4567</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <IconMapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            <span>{tContact("addressValue")}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-line py-5">
        <p className="container-page text-center text-xs text-ink-soft">
          © {new Date().getFullYear()} {tSite("siteName")} — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
