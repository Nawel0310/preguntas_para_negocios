"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Diálogo modal sobre <dialog> nativo: foco atrapado, Escape y fondo inert los da el navegador.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onClick={(e) => {
        // Click en el backdrop (el propio <dialog>) cierra
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl",
        "backdrop:bg-black/55 backdrop:backdrop-blur-[2px]",
        "open:animate-[dialog-in_180ms_ease-out]",
        className,
      )}
    >
      {open ? (
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description ? (
                <p id={descId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-m-2 grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
          {footer ? <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
