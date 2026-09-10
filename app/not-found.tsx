import Link from "next/link";
import Logo from "@/components/Logo";
import { IconCompassOff, IconPlay } from "@/components/icons";

export default function RootNotFound() {
  return (
    <div className="container-page flex min-h-screen flex-col items-center justify-center py-16 text-center">
      <Logo className="mb-8" />
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-light">
        <IconCompassOff className="h-10 w-10 text-gold-dark" />
      </span>
      <p className="mt-6 text-6xl font-extrabold text-gold-dark sm:text-7xl">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">الصفحة غير موجودة</h1>
      <p className="mt-3 max-w-md text-ink-soft">عذرًا، الصفحة التي تبحث عنها غير متوفرة أو رُبما تم نقلها أو حذفها.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="btn-primary">
          العودة للرئيسية
        </Link>
        <Link href="/programs" className="btn-outline">
          <IconPlay className="h-4 w-4" />
          تصفح البرامج
        </Link>
      </div>
    </div>
  );
}
