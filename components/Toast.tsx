"use client";

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { IconCheck, IconX } from "./icons";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-gold/40 bg-card text-ink",
  error: "border-red-200 bg-card text-ink dark:border-red-500/30",
  info: "border-line bg-card text-ink",
};

const VARIANT_ICON_BG: Record<ToastVariant, string> = {
  success: "bg-gold-light text-gold-dark",
  error: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
  info: "bg-gold-light text-gold-dark",
};

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => dismiss(id), 4000);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-soft ${VARIANT_STYLES[t.variant]}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${VARIANT_ICON_BG[t.variant]}`}>
              {t.variant === "error" ? (
                <IconX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <IconCheck className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <p className="flex-1 text-sm font-bold leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="إغلاق الإشعار"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-bg hover:text-ink focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              <IconX className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
