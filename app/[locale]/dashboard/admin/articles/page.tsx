"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { useAdminProfile } from "@/lib/supabase/useAdminProfile";
import { createClient } from "@/lib/supabase/client";
import {
  ArticleCategory,
  ArticleInput,
  ArticleRow,
  createArticle,
  deleteArticle,
  listAllArticlesAdmin,
  updateArticle,
} from "@/lib/supabase/articles";
import { useToast } from "@/components/Toast";
import { IconX } from "@/components/icons";

const STATUS_STYLES: Record<ArticleRow["status"], string> = {
  published: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  draft: "bg-gold-light text-gold-dark",
};

const CATEGORIES: ArticleCategory[] = ["الحفظ", "التجويد", "التربية", "عام"];

const EMPTY_FORM: ArticleInput = {
  title: "",
  title_en: "",
  excerpt: "",
  excerpt_en: "",
  content: "",
  content_en: "",
  category: "عام",
  image: "",
  status: "published",
};

export default function AdminArticlesPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const { name: adminName, title: adminTitle, updateName } = useAdminProfile();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const tStatus = useTranslations("Dashboard.status");
  const tArticles = useTranslations("Articles");
  const { showToast } = useToast();

  const CATEGORY_KEYS: Record<ArticleCategory, string> = {
    الحفظ: tArticles("catHifz"),
    التجويد: tArticles("catTajweed"),
    التربية: tArticles("catTarbiya"),
    عام: tArticles("catGeneral"),
  };

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [ready, setReady] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleInput | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const supabase = createClient();
    const rows = await listAllArticlesAdmin(supabase);
    setArticles(rows);
    setReady(true);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditingId("new");
    setForm({ ...EMPTY_FORM });
  }

  function openEdit(row: ArticleRow) {
    setEditingId(row.id);
    setForm({
      title: row.title,
      title_en: row.title_en ?? "",
      excerpt: row.excerpt,
      excerpt_en: row.excerpt_en ?? "",
      content: row.content,
      content_en: row.content_en ?? "",
      category: row.category,
      image: row.image ?? "",
      status: row.status,
    });
  }

  function closeModal() {
    setEditingId(null);
    setForm(null);
  }

  async function save() {
    if (!form || !editingId) return;
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      showToast(t("errorArticleFields"), "error");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const ok =
      editingId === "new" ? await createArticle(supabase, form) : await updateArticle(supabase, editingId, form);
    setSaving(false);
    if (ok) {
      showToast(t("articleSaved"), "success");
      closeModal();
      await loadData();
    } else {
      showToast(t("errorArticleSave"), "error");
    }
  }

  async function remove(row: ArticleRow) {
    if (!window.confirm(t("confirmDeleteArticle"))) return;
    setActingOn(row.id);
    const ok = await deleteArticle(createClient(), row.id);
    if (ok) {
      showToast(t("articleDeleted"), "success");
      await loadData();
    }
    setActingOn(null);
  }

  return (
    <DashboardShell navItems={adminNav} userName={adminName} userSubtitle={adminTitle} onLogout={handleLogout} onEditName={updateName}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader title={t("articlesTitle")} subtitle={t("articlesSubtitle")} />
        <button onClick={openCreate} className="btn-primary shrink-0">
          {t("addArticle")}
        </button>
      </div>

      {!ready ? null : articles.length === 0 ? (
        <div className="card p-6">
          <p className="text-sm text-ink-soft">{t("noArticlesYetAdmin")}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-y border-line bg-bg text-ink-soft">
                  <th className="px-6 py-3 text-start font-bold">{tc("title")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("author")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("views")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("publishDate")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("statusLabel")}</th>
                  <th className="px-6 py-3 text-start font-bold">{tc("action")}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 font-bold text-ink">{a.title}</td>
                    <td className="px-6 py-4 text-ink-soft">{t("authorTeam")}</td>
                    <td className="px-6 py-4 text-ink-soft">{a.views.toLocaleString("en-US")}</td>
                    <td className="px-6 py-4 text-ink-soft">{a.created_at.slice(0, 10)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[a.status]}`}>
                        {tStatus(a.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(a)} className="text-xs font-bold text-gold-dark hover:underline">
                          {tc("edit")}
                        </button>
                        <button
                          onClick={() => remove(a)}
                          disabled={actingOn === a.id}
                          className="text-xs font-bold text-red-500 hover:underline disabled:opacity-50"
                        >
                          {t("deleteArticleCta")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingId && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="animate-overlay-in absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="card animate-fade-up relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-7">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink">
                {editingId === "new" ? t("newArticleModalTitle") : t("editArticleModalTitle")}
              </h3>
              <button onClick={closeModal} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">
                <IconX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("articleFieldTitle")}</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("articleFieldTitleEn")}</label>
                  <input dir="ltr" className="input" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("articleFieldExcerpt")}</label>
                  <textarea rows={2} className="input resize-none" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("articleFieldExcerptEn")}</label>
                  <textarea dir="ltr" rows={2} className="input resize-none" value={form.excerpt_en} onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">{t("articleFieldContent")}</label>
                <textarea rows={6} className="input resize-none" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                <span className="text-xs text-ink-soft">{t("articleContentHint")}</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-ink">{t("articleFieldContentEn")}</label>
                <textarea dir="ltr" rows={6} className="input resize-none" value={form.content_en} onChange={(e) => setForm({ ...form, content_en: e.target.value })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("articleFieldCategory")}</label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ArticleCategory })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_KEYS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink">{t("articleFieldImage")}</label>
                  <input dir="ltr" className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-ink">{t("articleFieldStatus")}</span>
                <div className="grid grid-cols-2 gap-2 rounded-pill border border-line bg-bg p-1">
                  {(["published", "draft"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      aria-pressed={form.status === s}
                      className={`rounded-pill py-2 text-sm font-bold transition-colors ${
                        form.status === s ? "bg-gold-gradient text-white shadow-soft" : "text-ink-soft"
                      }`}
                    >
                      {tStatus(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button onClick={closeModal} className="btn-outline">
                  {t("editCancel")}
                </button>
                <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-70">
                  {saving ? t("editSaving") : t("editSave")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
