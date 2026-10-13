"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { preloadNiche } from "@/lib/niche-client";
import { categoryOfNiche, NICHE_BY_ID, NICHES_BY_CATEGORY, normalizeText } from "@/lib/niches";

/** Selector de nicho con buscador, agrupado por categoría (138 nichos) */
export function NichePicker({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (nicheId: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const searchId = useId();

  const groups = useMemo(() => {
    const q = normalizeText(deferred.trim());
    if (!q) return NICHES_BY_CATEGORY;
    return NICHES_BY_CATEGORY.map((g) => {
      const catMatch = normalizeText(g.category.name).includes(q);
      return {
        category: g.category,
        niches: catMatch ? g.niches : g.niches.filter((n) => normalizeText(n.name).includes(q)),
      };
    }).filter((g) => g.niches.length > 0);
  }, [deferred]);

  const selected = value ? NICHE_BY_ID.get(value) : undefined;

  const pick = (nicheId: string) => {
    onChange(nicheId);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-lg border border-input bg-card px-3 py-2 text-left text-base",
          "transition-[border-color,box-shadow] duration-150 hover:border-foreground/30",
          "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          "data-[invalid=true]:border-destructive",
        )}
      >
        <span className="min-w-0 flex-1">
          {selected ? (
            <>
              <span className="block truncate">{selected.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{categoryOfNiche(selected.id)?.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Elegí un nicho…</span>
          )}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Elegí el nicho"
        description="Buscá por nombre del nicho o por categoría."
        className="max-w-xl"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor={searchId} className="sr-only">
            Buscar nicho
          </label>
          <Input
            id={searchId}
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: odontología, gimnasio, abogado…"
            className="pl-9"
            autoComplete="off"
          />
        </div>
        <div className="-mx-5 max-h-[55dvh] overflow-y-auto overscroll-contain px-5">
          {groups.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Ningún nicho coincide con “{query}”.</p>
          ) : (
            groups.map((g) => (
              <div key={g.category.id} className="py-2">
                <p className="sticky top-0 z-10 bg-popover py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.category.name}
                </p>
                <ul className="flex flex-col">
                  {g.niches.map((n) => {
                    const isSelected = n.id === value;
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => pick(n.id)}
                          onPointerEnter={() => preloadNiche(n.id)}
                          onFocus={() => preloadNiche(n.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors duration-150",
                            "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected && "bg-primary/15 font-medium",
                          )}
                        >
                          <span className="flex-1">{n.name}</span>
                          {isSelected ? <Check className="size-4 text-foreground" aria-hidden="true" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </Dialog>
    </>
  );
}
