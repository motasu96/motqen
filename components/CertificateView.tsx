"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { CertificateRow } from "@/lib/supabase/certificates";
import CertificateTemplate from "@/components/CertificateTemplate";
import { IconX } from "@/components/icons";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.motqen.site";
const CERT_WIDTH = 1123;
const CERT_HEIGHT = 794;

export default function CertificateView({ cert, onClose }: { cert: CertificateRow; onClose: () => void }) {
  const t = useTranslations("Certificates");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(`${SITE_URL}/verify/${cert.certificate_number}`, { margin: 0, width: 200 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cert.certificate_number]);

  // transform: scale() shrinks the certificate visually but not its
  // contribution to layout (offsetWidth/offsetHeight stay 1123x794), so
  // the container must reserve exactly the post-scale size itself or the
  // modal overflows. This keeps the preview correctly sized at any width;
  // the download below uses a separate, always-unscaled copy (see exportRef).
  useLayoutEffect(() => {
    function updateScale() {
      const el = containerRef.current;
      if (!el) return;
      setScale(Math.min(1, el.clientWidth / CERT_WIDTH));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  async function handleDownload() {
    const node = exportRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      // pixelRatio 3 renders the 1123x794 template at ~3369x2382px, which
      // maps to ~288 DPI once placed on an A4 page below — print-quality
      // sharpness rather than the ~96 DPI a screen-res capture would give.
      const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true });
      // The template's 1123x794 size is itself A4 landscape at 96 DPI
      // (1123/96*25.4 ≈ 297mm, 794/96*25.4 ≈ 210mm), so the image fills the
      // page edge-to-edge with no distortion.
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210, undefined, "FAST");
      pdf.save(`${cert.certificate_number}.pdf`);
    } catch {
      // eslint-disable-next-line no-console
      console.error("Certificate export failed");
    }
    setDownloading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true">
      <div className="animate-overlay-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="card animate-fade-up relative w-full max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-ink">{t("viewTitle")}</h3>
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line">
            <IconX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={containerRef}
          dir="ltr"
          className="w-full overflow-hidden rounded-2xl"
          style={{ height: CERT_HEIGHT * scale }}
        >
          {/* dir="ltr" above is required: this box is wider than its RTL-page
              container, and a block element wider than its container aligns
              to its inline-start edge — the *right* edge in RTL — so without
              forcing LTR here it overflows off-screen to the left instead of
              sitting flush at the top-left corner the scale transform assumes. */}
          <div
            ref={wrapperRef}
            style={{ width: CERT_WIDTH, height: CERT_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}
          >
            <CertificateTemplate cert={cert} locale={locale} qrDataUrl={qrDataUrl} />
          </div>
        </div>

        <button onClick={handleDownload} disabled={downloading} className="btn-primary mt-4 w-full disabled:opacity-70">
          {downloading ? "..." : t("downloadCta")}
        </button>
      </div>

      {/* Export capture must never go through the scaled preview node above:
          html-to-image paints the wrapper's CSS transform into the canvas
          while sizing the canvas itself from the untransformed layout box,
          so a scale(<1) preview renders its content shrunk into a corner
          with the rest of the canvas left fully transparent — invisible on
          a page background, but painted white once embedded in the PDF.
          This off-screen copy is never transformed, so it always captures
          at true 1:1 size regardless of the modal's on-screen width. */}
      <div style={{ position: "fixed", top: 0, left: -99999, width: CERT_WIDTH, height: CERT_HEIGHT }} aria-hidden="true">
        <div ref={exportRef} style={{ width: CERT_WIDTH, height: CERT_HEIGHT }}>
          <CertificateTemplate cert={cert} locale={locale} qrDataUrl={qrDataUrl} />
        </div>
      </div>
    </div>
  );
}
