"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Breadcrumb } from "@/components/ui";
import { IconCheck, IconTeacherBadge } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";

type Gender = "male" | "female";

type UploadResult = { path: string | null; error: string | null };

async function uploadFile(bucket: string, file: File): Promise<UploadResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { path: null, error: null };
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return { path: null, error: error.message };
  return { path, error: null };
}

export default function JoinAsTeacherPage() {
  const t = useTranslations("JoinTeacher");
  const tNav = useTranslations("Nav");
  const { showToast } = useToast();

  const [gender, setGender] = useState<Gender | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const SPECIALTY_OPTIONS = [
    { key: "hifz", label: t("specialtyHifz") },
    { key: "tajweed", label: t("specialtyTajweed") },
    { key: "qiraat", label: t("specialtyQiraat") },
    { key: "kids", label: t("specialtyKids") },
    { key: "women", label: t("specialtyWomen") },
  ];

  function toggleSpecialty(label: string) {
    setSpecialties((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!gender) {
      showToast(t("errorGender"), "error");
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);

    const [photoResult, certificateResult] = await Promise.all([
      photoFile ? uploadFile("teacher-photos", photoFile) : Promise.resolve<UploadResult>({ path: null, error: null }),
      certificateFile ? uploadFile("teacher-certificates", certificateFile) : Promise.resolve<UploadResult>({ path: null, error: null }),
    ]);

    if (photoFile && photoResult.error) {
      setSubmitting(false);
      showToast(t("photoUploadError", { error: photoResult.error }), "error");
      return;
    }
    if (certificateFile && certificateResult.error) {
      setSubmitting(false);
      showToast(t("certificateUploadError", { error: certificateResult.error }), "error");
      return;
    }

    const photoUrl = photoResult.path
      ? createClient().storage.from("teacher-photos").getPublicUrl(photoResult.path).data.publicUrl
      : null;
    const certificatePath = certificateResult.path;

    try {
      await fetch("/api/teacher-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          gender,
          specialties,
          yearsExperience: data.get("yearsExperience"),
          ijazah: data.get("ijazah"),
          bio: data.get("bio"),
          photoUrl,
          certificatePath,
        }),
      });
    } catch {}
    setSubmitting(false);
    setSent(true);
    showToast(t("toastSuccess"), "success");
  }

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("title") }]} />

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
          <IconTeacherBadge className="h-7 w-7 text-gold-dark" />
        </span>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="max-w-xl text-ink-soft">{t("description")}</p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <div className="card p-7 sm:p-9">
          {sent ? (
            <div className="animate-fade-up flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-light">
                <IconCheck className="h-8 w-8 text-gold-dark" />
              </div>
              <h3 className="text-lg font-extrabold text-ink">{t("successTitle")}</h3>
              <p className="text-sm text-ink-soft">{t("successDesc")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="ta-name" className="text-sm font-bold text-ink">{t("nameLabel")}</label>
                  <input id="ta-name" name="name" required className="input" placeholder={t("namePlaceholder")} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="ta-phone" className="text-sm font-bold text-ink">{t("phoneLabel")}</label>
                  <input id="ta-phone" name="phone" required dir="ltr" className="input" placeholder={t("phonePlaceholder")} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ta-email" className="text-sm font-bold text-ink">{t("emailLabel")}</label>
                <input id="ta-email" name="email" required type="email" dir="ltr" className="input" placeholder={t("emailPlaceholder")} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ta-photo" className="text-sm font-bold text-ink">{t("photoLabel")}</label>
                <input
                  id="ta-photo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="input file:me-3 file:rounded-pill file:border-0 file:bg-gold-light file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-gold-dark"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
                <span className="text-xs text-ink-soft">{t("photoHint")}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">{t("genderLabel")}</span>
                <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      aria-pressed={gender === g}
                      className={`rounded-pill py-2 text-sm font-bold transition-colors ${
                        gender === g ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
                      }`}
                    >
                      {g === "male" ? t("genderMale") : t("genderFemale")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">{t("specialtiesLabel")}</span>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleSpecialty(opt.label)}
                      aria-pressed={specialties.includes(opt.label)}
                      className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                        specialties.includes(opt.label)
                          ? "bg-gold-gradient text-white shadow-soft"
                          : "border border-line bg-bg text-ink-soft hover:text-gold-dark"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ta-experience" className="text-sm font-bold text-ink">{t("experienceLabel")}</label>
                <input
                  id="ta-experience"
                  name="yearsExperience"
                  type="number"
                  inputMode="numeric"
                  dir="ltr"
                  className="input max-w-[160px]"
                  placeholder={t("experiencePlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ta-ijazah" className="text-sm font-bold text-ink">{t("ijazahLabel")}</label>
                <textarea id="ta-ijazah" name="ijazah" rows={3} className="input resize-none" placeholder={t("ijazahPlaceholder")} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ta-certificate" className="text-sm font-bold text-ink">{t("certificateLabel")}</label>
                <input
                  id="ta-certificate"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="input file:me-3 file:rounded-pill file:border-0 file:bg-gold-light file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-gold-dark"
                  onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
                />
                <span className="text-xs text-ink-soft">{t("certificateHint")}</span>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ta-bio" className="text-sm font-bold text-ink">{t("bioLabel")}</label>
                <textarea id="ta-bio" name="bio" required rows={4} className="input resize-none" placeholder={t("bioPlaceholder")} />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-70 sm:w-fit">
                {submitting ? t("submitting") : t("submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
