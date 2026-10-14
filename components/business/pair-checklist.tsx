"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export interface PairItem {
  /** problemId: problema y solución van 1:1, así el match se cruza por problema */
  id: string;
  label: string;
  detail?: string;
  /** El mismo par ya quedó marcado del otro lado (problema ↔ solución) */
  paired?: boolean;
}

/** Checklist de match con el nicho: soluciones que eligió como prioridad o dolores que mencionó */
export function PairChecklist({
  legend,
  hint,
  items,
  selected,
  onChange,
  pairedLabel,
}: {
  legend: string;
  hint: string;
  items: PairItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
  pairedLabel: string;
}) {
  const set = new Set(selected);
  const toggle = (id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    // Conserva el orden de los ítems del nicho
    onChange(items.map((i) => i.id).filter((iid) => next.has(iid)));
  };

  return (
    <fieldset className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const on = set.has(item.id);
          return (
            <label
              key={item.id}
              className={cn(
                "flex min-h-11 items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                on ? "border-accent/60 bg-accent/10" : "border-border hover:bg-muted/60",
              )}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(item.id)} className="sr-only" />
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded border",
                  on ? "border-accent bg-accent text-accent-foreground" : "border-input bg-card",
                )}
                aria-hidden="true"
              >
                {on ? <Check className="size-3.5" /> : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="first-letter:uppercase">{item.label}</span>
                {item.detail ? <span className="text-xs text-muted-foreground">{item.detail}</span> : null}
                {item.paired ? (
                  <Badge tone="accent" className="mt-1 self-start">
                    {pairedLabel}
                  </Badge>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
