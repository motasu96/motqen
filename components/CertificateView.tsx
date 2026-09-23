"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CertificateRow, GRADE_LABEL_TRANSLATION_KEYS } from "@/lib/supabase/certificates";
import { IconX } from "@/components/icons";

// Certificate template rendering. Until the final design (provided by the
// site owner) is dropped in at /public/certificates/template.png, this
// draws a plain placeholder card so the feature works end-to-end — once
// the real template arrives, only TEMPLATE_SRC and FIELD_POSITIONS below
// need recalibrating, nothing else in this feature changes.
const TEMPLATE_SRC = "/certificates/template.png";
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1131;

const FIELD_POSITIONS = {
  studentName: { x: CANVAS_WIDTH / 2, y: 500, fontSize: 60, weight: "bold", color: "#8a6d1f" },
  achievement: { x: CANVAS_WIDTH / 2, y: 610, fontSize: 34, weight: "normal", color: "#3a2f22" },
  grade: { x: CANVAS_WIDTH / 2, y: 660, fontSize: 28, weight: "bold", color: "#8a6d1f" },
  teacherName: { x: CANVAS_WIDTH * 0.72, y: 960, fontSize: 26, weight: "normal", color: "#3a2f22" },
  issuedByName: { x: CANVAS_WIDTH * 0.28, y: 960, fontSize: 26, weight: "normal", color: "#3a2f22" },
  issuedAt: { x: CANVAS_WIDTH / 2, y: 1040, fontSize: 22, weight: "normal", color: "#6b5c46" },
};

function formatGrade(cert: CertificateRow, tCert: (key: string) => string) {
  const label = cert.grade_label ? tCert(GRADE_LABEL_TRANSLATION_KEYS[cert.grade_label]) : null;
  const percent = cert.grade_percent != null ? `${cert.grade_percent}%` : null;
  if (!label && !percent) return null;
  return [percent, label].filter(Boolean).join(" — ");
}

function drawText(ctx: CanvasRenderingContext2D, cert: CertificateRow, tCert: (key: string) => string) {
  ctx.direction = "rtl";
  ctx.textAlign = "center";

  const draw = (text: string, pos: (typeof FIELD_POSITIONS)[keyof typeof FIELD_POSITIONS]) => {
    ctx.font = `${pos.weight} ${pos.fontSize}px Tajawal, sans-serif`;
    ctx.fillStyle = pos.color;
    ctx.fillText(text, pos.x, pos.y);
  };

  draw(cert.student_name, FIELD_POSITIONS.studentName);
  draw(cert.achievement, FIELD_POSITIONS.achievement);
  const grade = formatGrade(cert, tCert);
  if (grade) draw(`${tCert("labelGrade")} ${grade}`, FIELD_POSITIONS.grade);
  draw(`${tCert("labelTeacher")} ${cert.teacher_name}`, FIELD_POSITIONS.teacherName);
  draw(`${tCert("labelIssuedBy")} ${cert.issued_by_name}`, FIELD_POSITIONS.issuedByName);
  draw(cert.issued_at, FIELD_POSITIONS.issuedAt);
}

function CertificateCanvas({ cert, onCanvas }: { cert: CertificateRow; onCanvas?: (c: HTMLCanvasElement) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tCert = useTranslations("Certificates");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    async function render() {
      if (!ctx) return;
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {}
      if (cancelled) return;

      const img = new Image();
      img.onload = () => {
        if (cancelled || !canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        drawText(ctx, cert, tCert);
        onCanvas?.(canvas);
      };
      img.onerror = () => {
        if (cancelled || !canvas) return;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        ctx.fillStyle = "#FBF7EE";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#C9A24B";
        ctx.lineWidth = 10;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
        drawText(ctx, cert, tCert);
        onCanvas?.(canvas);
      };
      img.src = TEMPLATE_SRC;
    }
    render();

    return () => {
      cancelled = true;
    };
  }, [cert, tCert, onCanvas]);

  return <canvas ref={canvasRef} className="w-full rounded-2xl border border-line" />;
}

export default function CertificateView({ cert, onClose }: { cert: CertificateRow; onClose: () => void }) {
  const t = useTranslations("Certificates");
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  function handleDownload() {
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.student_name || "certificate"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="animate-overlay-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="card animate-fade-up relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-ink">{t("viewTitle")}</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">
            <IconX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <CertificateCanvas cert={cert} onCanvas={setCanvas} />

        <button onClick={handleDownload} disabled={!canvas} className="btn-primary mt-4 w-full disabled:opacity-70">
          {t("downloadCta")}
        </button>
      </div>
    </div>
  );
}
