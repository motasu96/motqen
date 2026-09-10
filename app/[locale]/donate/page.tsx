"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Breadcrumb, Eyebrow } from "@/components/ui";
import { IconCheck, IconEye, IconHeart, IconTarget } from "@/components/icons";
import { useToast } from "@/components/Toast";

export default function DonatePage() {
  const t = useTranslations("Donate");
  const tNav = useTranslations("Nav");
  const { showToast } = useToast();

  const TIERS = [
    { amount: t("tier1Amount"), period: t("tier1Period"), title: t("tier1Title"), desc: t("tier1Desc"), popular: false },
    { amount: t("tier2Amount"), period: t("tier2Period"), title: t("tier2Title"), desc: t("tier2Desc"), popular: true },
    { amount: t("tier3Amount"), period: t("tier3Period"), title: t("tier3Title"), desc: t("tier3Desc"), popular: false },
  ];

  const REASONS = [
    { icon: IconTarget, title: t("reason1Title"), desc: t("reason1Desc") },
    { icon: IconHeart, title: t("reason2Title"), desc: t("reason2Desc") },
    { icon: IconEye, title: t("reason3Title"), desc: t("reason3Desc") },
  ];

  const AMOUNT_OPTIONS = [t("tier1Amount"), t("tier2Amount"), t("tier3Amount")];

  const [amount, setAmount] = useState(AMOUNT_OPTIONS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"once" | "monthly">("monthly");
  const [sent, setSent] = useState(false);

  function handleSelectAmount(value: string) {
    setAmount(value);
    setCustomAmount("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    showToast(t("toastSuccess"), "success");
  }

  return (
    <div className="container-page section">
      <Breadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("donate") }]} />

      <div className="mt-6 flex max-w-2xl flex-col gap-3">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="text-3xl font-extrabold leading-snug text-ink sm:text-4xl">{t("title")}</h1>
        <p className="leading-relaxed text-ink-soft">{t("description")}</p>
      </div>

      <div className="mt-14">
        <h2 className="mb-6 text-xl font-extrabold text-ink sm:text-2xl">{t("tiersTitle")}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.title}
              className={`card relative flex flex-col gap-3 p-7 ${tier.popular ? "border-gold shadow-[0_28px_54px_-24px_rgba(200,155,74,0.45)]" : ""}`}
            >
              {tier.popular && (
                <span className="absolute -top-3 start-7 rounded-pill bg-gold-gradient px-3 py-1 text-xs font-bold text-white shadow-soft">
                  {t("popularBadge")}
                </span>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-gold-dark">{tier.amount}</span>
                <span className="text-sm text-ink-soft">{tier.period}</span>
              </div>
              <h3 className="text-base font-extrabold text-ink">{tier.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{tier.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="mb-6 text-xl font-extrabold text-ink sm:text-2xl">{t("whyTitle")}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {REASONS.map((r) => (
            <div key={r.title} className="flex flex-col items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-light">
                <r.icon className="h-6 w-6 text-gold-dark" />
              </div>
              <h3 className="text-base font-extrabold text-ink">{r.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-7 sm:p-9">
          {sent ? (
            <div className="animate-fade-up flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-light">
                <IconCheck className="h-8 w-8 text-gold-dark" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-extrabold text-ink">{t("successTitle")}</h3>
              <p className="text-sm text-ink-soft">{t("successDesc")}</p>
              <button onClick={() => setSent(false)} className="btn-outline mt-2">
                {t("donateAgain")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">{t("formTitle")}</h2>
              <p className="text-xs leading-relaxed text-ink-soft">{t("formNote")}</p>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">{t("amountLabel")}</span>
                <div className="grid grid-cols-3 gap-2">
                  {AMOUNT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={amount === opt}
                      onClick={() => handleSelectAmount(opt)}
                      className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                        amount === opt
                          ? "border-gold bg-gold-gradient text-white shadow-soft"
                          : "border-line text-ink hover:border-gold"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) setAmount("");
                  }}
                  dir="ltr"
                  className="input mt-1"
                  placeholder={t("customAmountPlaceholder")}
                  aria-label={t("customAmountLabel")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">{t("frequencyLabel")}</span>
                <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1" role="group" aria-label={t("frequencyLabel")}>
                  {(
                    [
                      { key: "monthly", label: t("frequencyMonthly") },
                      { key: "once", label: t("frequencyOneTime") },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFrequency(f.key)}
                      aria-pressed={frequency === f.key}
                      className={`rounded-pill py-2.5 text-sm font-bold transition-colors ${
                        frequency === f.key ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="donate-name" className="text-sm font-bold text-ink">{t("nameLabel")}</label>
                  <input id="donate-name" required className="input" placeholder={t("namePlaceholder")} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="donate-email" className="text-sm font-bold text-ink">{t("emailLabel")}</label>
                  <input id="donate-email" required type="email" dir="ltr" className="input" placeholder={t("emailPlaceholder")} />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full sm:w-fit">
                <IconHeart className="h-4 w-4" aria-hidden="true" />
                {t("submit")}
              </button>
            </form>
          )}
        </div>

        <div className="card flex flex-col gap-3 p-7">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-light">
            <IconHeart className="h-6 w-6 text-gold-dark" aria-hidden="true" />
          </span>
          <h3 className="text-base font-extrabold text-ink">{t("bankTitle")}</h3>
          <p className="text-sm leading-relaxed text-ink-soft">{t("bankDesc")}</p>
        </div>
      </div>
    </div>
  );
}
