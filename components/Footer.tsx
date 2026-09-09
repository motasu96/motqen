import Link from "next/link";
import Logo from "./Logo";
import { IconMail, IconMapPin, IconPhone } from "./icons";

const QUICK_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/programs", label: "برامجنا" },
  { href: "/teachers", label: "المعلمون" },
  { href: "/articles", label: "المقالات" },
];

const HELP_LINKS = [
  { href: "/about", label: "عن متقن" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/login", label: "تسجيل الدخول" },
  { href: "/signup", label: "إنشاء حساب" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="text-sm leading-relaxed text-ink-soft">
            منصة تعليمية إلكترونية متخصصة في تعليم القرآن الكريم عن بُعد، بإشراف نخبة من المعلمين
            والمعلمات، في بيئة تربوية آمنة ومحفزة.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-extrabold text-ink">روابط سريعة</h4>
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-soft hover:text-gold-dark">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-extrabold text-ink">صفحات مهمة</h4>
          {HELP_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-soft hover:text-gold-dark">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-extrabold text-ink">تواصل معنا</h4>
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
            <span>الرياض، المملكة العربية السعودية</span>
          </div>
        </div>
      </div>

      <div className="border-t border-line py-5">
        <p className="container-page text-center text-xs text-ink-soft">
          © {new Date().getFullYear()} متقن — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
