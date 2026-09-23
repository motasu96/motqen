"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconChat, IconSend, IconX } from "./icons";

const SESSION_STORAGE_KEY = "motqen_chat_session_id";

type ChatMessage = { role: "user" | "assistant"; text: string };

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export default function ChatWidget() {
  const t = useTranslations("Chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", text: t("greeting") }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setDraft("");
    setSending(true);

    try {
      const res = await fetch("/api/site-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: getSessionId(), locale }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: res.status === 501 ? t("unavailable") : t("errorGeneric") }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: t("errorGeneric") }]);
    }
    setSending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("closeAria") : t("openAria")}
        aria-expanded={open}
        className="btn-primary fixed bottom-6 end-6 z-[90] flex h-14 w-14 items-center justify-center !rounded-full !p-0 shadow-[0_14px_28px_-10px_rgba(200,155,74,0.55)] transition-transform hover:scale-105"
      >
        {open ? <IconX className="h-6 w-6" aria-hidden="true" /> : <IconChat className="h-6 w-6" aria-hidden="true" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-widget-title"
          className="animate-toast-in card fixed bottom-24 end-6 z-[90] flex h-[min(70vh,32rem)] w-[min(92vw,24rem)] flex-col overflow-hidden p-0"
        >
          <div className="flex items-center gap-3 border-b border-line bg-bg px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-light">
              <IconChat className="h-5 w-5 text-gold-dark" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="chat-widget-title" className="truncate text-sm font-extrabold text-ink">
                {t("title")}
              </h2>
              <p className="truncate text-xs text-ink-soft">{t("subtitle")}</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "self-end bg-gold-gradient text-white"
                      : "self-start border border-line bg-bg text-ink"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {sending && (
                <div className="self-start rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm text-ink-soft">
                  {t("thinking")}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("placeholder")}
              className="input flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label={t("send")}
              className="btn-primary flex h-11 w-11 shrink-0 items-center justify-center !rounded-full !p-0 disabled:opacity-50"
            >
              <IconSend className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
