"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { useAdminProfile } from "@/lib/supabase/useAdminProfile";
import { createClient } from "@/lib/supabase/client";
import {
  activateStudentPackage,
  deletePackage,
  listAllPackages,
  listStudentOptions,
  listStudentPackages,
  PackageRow,
  PAYMENT_METHODS,
  PaymentMethod,
  savePackage,
  setPackageActive,
  StudentOption,
  StudentPackageRow,
  subscriptionState,
  SubscriptionState,
  voidStudentPackage,
} from "@/lib/supabase/packages";
import { useToast } from "@/components/Toast";

type PackageForm = {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  lessons: string;
  price: string;
  validity: string;
  order: string;
  active: boolean;
};

const EMPTY_FORM: PackageForm = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  lessons: "4",
  price: "",
  validity: "30",
  order: "0",
  active: true,
};

const STATE_BADGE: Record<SubscriptionState, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  exhausted: "bg-gold-light text-gold-dark",
  expired: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  void: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
};

function toInt(value: string): number | null {
  return /^\d+$/.test(value.trim()) ? parseInt(value.trim(), 10) : null;
}

function toMoney(value: string): number | null {
  const n = Number(value.trim());
  return value.trim() !== "" && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

export default function AdminPackagesPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const { name: adminName, title: adminTitle, updateName } = useAdminProfile();
  const t = useTranslations("Packages.admin");
  const { showToast } = useToast();

  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<StudentPackageRow[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [ready, setReady] = useState(false);

  const [form, setForm] = useState<PackageForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [studentQuery, setStudentQuery] = useState("");
  const [studentId, setStudentId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("whatsapp");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [activating, setActivating] = useState(false);

  async function load() {
    const supabase = createClient();
    const [pk, subs, st] = await Promise.all([listAllPackages(supabase), listStudentPackages(supabase), listStudentOptions(supabase)]);
    setPackages(pk);
    setSubscriptions(subs);
    setStudents(st);
    setReady(true);
  }

  useEffect(() => {
    load();
  }, []);

  const matchingStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    const list = q ? students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) : students;
    return list.slice(0, 100);
  }, [students, studentQuery]);

  function startEdit(p: PackageRow) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      nameEn: p.name_en ?? "",
      description: p.description ?? "",
      descriptionEn: p.description_en ?? "",
      lessons: String(p.lessons_count),
      price: String(p.price_usd),
      validity: String(p.validity_days),
      order: String(p.sort_order),
      active: p.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const lessons = toInt(form.lessons);
    const validity = toInt(form.validity);
    const order = toInt(form.order) ?? 0;
    const price = toMoney(form.price);
    if (!form.name.trim() || !lessons || lessons < 1 || !validity || validity < 1 || price === null) {
      showToast(t("errorFields"), "error");
      return;
    }
    setSaving(true);
    const ok = await savePackage(
      createClient(),
      {
        name: form.name.trim(),
        name_en: form.nameEn.trim() || null,
        description: form.description.trim() || null,
        description_en: form.descriptionEn.trim() || null,
        lessons_count: lessons,
        price_usd: price,
        validity_days: validity,
        is_active: form.active,
        sort_order: order,
      },
      editingId ?? undefined
    );
    setSaving(false);
    if (!ok) {
      showToast(t("errorSave"), "error");
      return;
    }
    showToast(t("toastSaved"), "success");
    resetForm();
    await load();
  }

  async function handleToggle(p: PackageRow) {
    const ok = await setPackageActive(createClient(), p.id, !p.is_active);
    if (!ok) {
      showToast(t("errorSave"), "error");
      return;
    }
    setPackages((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: !p.is_active } : x)));
  }

  async function handleDelete(p: PackageRow) {
    if (!window.confirm(t("confirmDelete"))) return;
    const ok = await deletePackage(createClient(), p.id);
    if (!ok) {
      showToast(t("errorSave"), "error");
      return;
    }
    if (editingId === p.id) resetForm();
    showToast(t("toastDeleted"), "success");
    await load();
  }

  function pickPackage(id: string) {
    setPackageId(id);
    const p = packages.find((x) => x.id === id);
    setAmount(p ? String(p.price_usd) : "");
  }

  async function handleActivate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const price = toMoney(amount);
    if (!studentId || !packageId || price === null) {
      showToast(t("errorActivateFields"), "error");
      return;
    }
    setActivating(true);
    const ok = await activateStudentPackage(createClient(), {
      studentId,
      packageId,
      paymentMethod: method,
      price,
      note: note.trim() || null,
    });
    setActivating(false);
    if (!ok) {
      showToast(t("errorActivate"), "error");
      return;
    }
    showToast(t("toastActivated"), "success");
    setStudentId("");
    setStudentQuery("");
    setPackageId("");
    setAmount("");
    setNote("");
    setMethod("whatsapp");
    await load();
  }

  async function handleVoid(s: StudentPackageRow) {
    if (!window.confirm(t("confirmVoid"))) return;
    const ok = await voidStudentPackage(createClient(), s.id);
    if (!ok) {
      showToast(t("errorVoid"), "error");
      return;
    }
    showToast(t("toastVoided"), "success");
    await load();
  }

  const activePackages = packages.filter((p) => p.is_active);

  return (
    <DashboardShell navItems={adminNav} userName={adminName} userSubtitle={adminTitle} onLogout={handleLogout} onEditName={updateName}>
      <DashboardPageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex flex-col gap-8">
        {/* Catalogue */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-ink">{t("catalogTitle")}</h2>

          <form onSubmit={handleSave} className="card flex flex-col gap-4 p-6">
            <h3 className="text-base font-extrabold text-ink">{editingId ? t("editPackage") : t("newPackage")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldName")}
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldNameEn")}
                <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} dir="ltr" className="input font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldDescription")}
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldDescriptionEn")}
                <input value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} dir="ltr" className="input font-normal" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldLessons")}
                <input value={form.lessons} onChange={(e) => setForm({ ...form, lessons: e.target.value })} inputMode="numeric" dir="ltr" className="input font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldPrice")}
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} inputMode="decimal" dir="ltr" className="input font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldValidity")}
                <input value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} inputMode="numeric" dir="ltr" className="input font-normal" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldOrder")}
                <input value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} inputMode="numeric" dir="ltr" className="input font-normal" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-ink">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              {t("fieldActive")}
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="btn-primary w-fit px-5 disabled:opacity-70">
                {saving ? t("saving") : t("save")}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="btn-outline w-fit px-5">
                  {t("cancelEdit")}
                </button>
              ) : null}
            </div>
          </form>

          {!ready ? null : packages.length === 0 ? (
            <div className="card p-6">
              <p className="text-sm text-ink-soft">{t("noPackages")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {packages.map((p) => (
                <div key={p.id} className="card flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-[180px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-ink">{p.name}</h3>
                      <span className="badge">{p.is_active ? t("visible") : t("hidden")}</span>
                    </div>
                    {p.name_en ? (
                      <p dir="ltr" className="text-start text-xs text-ink-soft">
                        {p.name_en}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-ink-soft">
                      {t("lessonsCount", { count: p.lessons_count })} · {t("validityDays", { count: p.validity_days })}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold text-gold-dark" dir="ltr">
                    {t("priceUsd", { price: p.price_usd })}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleToggle(p)} className="btn-outline px-3 py-1.5 text-xs">
                      {p.is_active ? t("hide") : t("show")}
                    </button>
                    <button onClick={() => startEdit(p)} className="btn-outline px-3 py-1.5 text-xs">
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/15"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activate a package for a student */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-ink">{t("activateTitle")}</h2>
          <form onSubmit={handleActivate} className="card flex flex-col gap-4 p-6">
            <p className="text-sm text-ink-soft">{t("activateHint")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldStudent")}
                <input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder={t("studentSearch")}
                  className="input font-normal"
                />
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input font-normal">
                  <option value="">{t("studentPlaceholder")}</option>
                  {matchingStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.email}
                      {s.name && s.email ? ` — ${s.email}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                  {t("fieldPackage")}
                  <select value={packageId} onChange={(e) => pickPackage(e.target.value)} className="input font-normal">
                    <option value="">{t("packagePlaceholder")}</option>
                    {activePackages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {t("lessonsCount", { count: p.lessons_count })} — {t("priceUsd", { price: p.price_usd })}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldMethod")}
                <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="input font-normal">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {t(`methods.${m}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
                {t("fieldAmount")}
                <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" dir="ltr" className="input font-normal" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
              {t("fieldNote")}
              <input value={note} onChange={(e) => setNote(e.target.value)} className="input font-normal" />
            </label>
            <button type="submit" disabled={activating} className="btn-primary w-fit px-5 disabled:opacity-70">
              {activating ? t("activating") : t("activate")}
            </button>
          </form>
        </section>

        {/* Subscriptions */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-extrabold text-ink">{t("subscriptionsTitle")}</h2>
          {!ready ? null : subscriptions.length === 0 ? (
            <div className="card p-6">
              <p className="text-sm text-ink-soft">{t("noSubscriptions")}</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line text-start text-xs text-ink-soft">
                    <th className="p-3 text-start font-bold">{t("colStudent")}</th>
                    <th className="p-3 text-start font-bold">{t("colPackage")}</th>
                    <th className="p-3 text-start font-bold">{t("colUsed")}</th>
                    <th className="p-3 text-start font-bold">{t("colPaid")}</th>
                    <th className="p-3 text-start font-bold">{t("colMethod")}</th>
                    <th className="p-3 text-start font-bold">{t("colExpires")}</th>
                    <th className="p-3 text-start font-bold">{t("colState")}</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => {
                    const state = subscriptionState(s);
                    return (
                      <tr key={s.id} className="border-b border-line last:border-0">
                        <td className="p-3 font-bold text-ink">{s.studentName || "—"}</td>
                        <td className="p-3 text-ink-soft">{s.packageName}</td>
                        <td className="p-3 text-ink-soft" dir="ltr">
                          {s.lessonsUsed} / {s.lessonsTotal}
                        </td>
                        <td className="p-3 text-ink-soft" dir="ltr">
                          {t("priceUsd", { price: s.pricePaid })}
                        </td>
                        <td className="p-3 text-ink-soft">{t(`methods.${s.paymentMethod}`)}</td>
                        <td className="p-3 text-ink-soft" dir="ltr">
                          {s.expiresAt.slice(0, 10)}
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATE_BADGE[state]}`}>{t(`states.${state}`)}</span>
                        </td>
                        <td className="p-3">
                          {state === "active" ? (
                            <button onClick={() => handleVoid(s)} className="text-xs font-bold text-red-500 hover:underline">
                              {t("voidAction")}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
