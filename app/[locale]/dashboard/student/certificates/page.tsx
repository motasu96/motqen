"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useStudentNav } from "@/components/dashboard/studentNav";
import { useStudentLogout } from "@/lib/supabase/useStudentLogout";
import { useStudentProfile } from "@/lib/supabase/useStudentProfile";
import { createClient } from "@/lib/supabase/client";
import { CertificateRow, GRADE_LABEL_TRANSLATION_KEYS, listMyCertificates } from "@/lib/supabase/certificates";
import CertificateView from "@/components/CertificateView";
import { IconAward } from "@/components/icons";

export default function StudentCertificatesPage() {
  const studentNav = useStudentNav();
  const handleLogout = useStudentLogout();
  const { name: studentName, title: studentTitle } = useStudentProfile();
  const t = useTranslations("Dashboard.student");
  const tc = useTranslations("Dashboard.common");
  const tCert = useTranslations("Certificates");

  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [ready, setReady] = useState(false);
  const [viewing, setViewing] = useState<CertificateRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setReady(true);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setReady(true);
        return;
      }
      const rows = await listMyCertificates(supabase, user.id);
      if (cancelled) return;
      setCertificates(rows);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell navItems={studentNav} userName={studentName} userSubtitle={studentTitle} onLogout={handleLogout}>
      <DashboardPageHeader title={t("certificatesTitle")} subtitle={t("certificatesSubtitle")} />

      {!ready ? null : certificates.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <IconAward className="h-8 w-8 text-gold-dark" aria-hidden="true" />
          <p className="text-sm text-ink-soft">{t("noCertificatesYetStudent")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certificates.map((c) => (
            <div key={c.id} className="card flex flex-col gap-3 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-light">
                <IconAward className="h-5 w-5 text-gold-dark" />
              </span>
              <div>
                <div className="text-sm font-extrabold text-ink">{c.achievement}</div>
                <div className="mt-1 text-xs text-ink-soft">
                  {c.grade_label ? `${tCert(GRADE_LABEL_TRANSLATION_KEYS[c.grade_label])}` : ""}
                  {c.grade_percent != null ? ` (${c.grade_percent}%)` : ""}
                  {c.grade_label || c.grade_percent != null ? " · " : ""}
                  {tc("with")} {c.teacher_name} · {c.issued_at}
                </div>
              </div>
              <button onClick={() => setViewing(c)} className="btn-outline w-fit px-4 py-2 text-xs">
                {t("viewCertificateCta")}
              </button>
            </div>
          ))}
        </div>
      )}

      {viewing && <CertificateView cert={viewing} onClose={() => setViewing(null)} />}
    </DashboardShell>
  );
}
