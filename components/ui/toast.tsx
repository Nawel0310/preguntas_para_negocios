"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = ++nextId.current;
      setItems((list) => [...list.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-popover p-3 pr-2 text-sm text-popover-foreground shadow-lg",
              "animate-[toast-in_200ms_ease-out]",
              t.tone === "error" ? "border-red-500/40" : "border-primary/50",
            )}
          >
            {t.tone === "error" ? (
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" aria-hidden="true" />
            )}
            <p className="flex-1 py-0.5">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar aviso"
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const ctx = use(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
