"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { useAdminNav } from "@/components/dashboard/adminNav";
import { useAdminLogout } from "@/lib/supabase/useAdminLogout";
import { useAdminProfile } from "@/lib/supabase/useAdminProfile";
import { createClient } from "@/lib/supabase/client";
import { createNotice, deleteNotice, listAllNotices, NoticeAudience, NoticeRow } from "@/lib/supabase/notices";
import { useToast } from "@/components/Toast";
import { IconMegaphone, IconX } from "@/components/icons";

export default function AdminNoticesPage() {
  const adminNav = useAdminNav();
  const handleLogout = useAdminLogout();
  const { name: adminName, title: adminTitle, updateName } = useAdminProfile();
  const t = useTranslations("Dashboard.admin");
  const tc = useTranslations("Dashboard.common");
  const { showToast } = useToast();

  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [ready, setReady] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<NoticeAudience>("all");
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const rows = await listAllNotices(supabase);
    setNotices(rows);
    setReady(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showToast(t("errorNoticeFields"), "error");
      return;
    }
    setSaving(true);
    const ok = await createNotice(createClient(), { title: title.trim(), body: body.trim(), audience });
    setSaving(false);
    if (!ok) {
      showToast(t("errorNoticeSave"), "error");
      return;
    }
    setTitle("");
    setBody("");
    setAudience("all");
    showToast(t("toastNoticePublished"), "success");
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDeleteNotice"))) return;
    const ok = await deleteNotice(createClient(), id);
    if (!ok) return;
    setNotices((prev) => prev.filter((n) => n.id !== id));
    showToast(t("toastNoticeDeleted"), "success");
  }

  const AUDIENCE_LABELS: Record<NoticeAudience, string> = {
    all: t("audienceAll"),
    students: t("audienceStudents"),
    teachers: t("audienceTeachers"),
  };

  return (
    <DashboardShell navItems={adminNav} userName={adminName} userSubtitle={adminTitle} onLogout={handleLogout} onEditName={updateName}>
      <DashboardPageHeader title={t("noticesTitle")} subtitle={t("noticesSubtitle")} />

      <div className="flex flex-col gap-6">
        <form onSubmit={handleCreate} className="card flex flex-col gap-4 p-6">
          <h3 className="text-base font-extrabold text-ink">{t("newNoticeTitle")}</h3>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("noticeTitlePlaceholder")} className="input" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("noticeBodyPlaceholder")}
            rows={3}
            className="input resize-none"
          />
          <select value={audience} onChange={(e) => setAudience(e.target.value as NoticeAudience)} className="input max-w-[220px]">
            <option value="all">{t("audienceAll")}</option>
            <option value="students">{t("audienceStudents")}</option>
            <option value="teachers">{t("audienceTeachers")}</option>
          </select>
          <button type="submit" disabled={saving} className="btn-primary w-fit px-5 disabled:opacity-70">
            {saving ? t("publishing") : t("publishNoticeCta")}
          </button>
        </form>

        {!ready ? null : (
          <div className="flex flex-col gap-4">
            {notices.length === 0 ? (
              <div className="card p-6">
                <p className="text-sm text-ink-soft">{t("noNoticesYet")}</p>
              </div>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="card flex gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-light">
                    <IconMegaphone className="h-5 w-5 text-gold-dark" />
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <h3 className="text-sm font-extrabold text-ink">{n.title}</h3>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="badge">{AUDIENCE_LABELS[n.audience]}</span>
                        <span className="text-xs text-ink-soft">{n.created_at.slice(0, 10)}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-ink-soft">{n.body}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    aria-label={tc("cancel")}
                    className="h-fit shrink-0 rounded-full p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/15"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
