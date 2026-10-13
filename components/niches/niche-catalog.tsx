"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/field";
import { NICHES_BY_CATEGORY, normalizeText } from "@/lib/niches";

export function NicheCatalog() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const groups = useMemo(() => {
    const q = normalizeText(deferred.trim());
    if (!q) return NICHES_BY_CATEGORY;
    return NICHES_BY_CATEGORY.map((g) =>
      normalizeText(g.category.name).includes(q)
        ? g
        : { ...g, niches: g.niches.filter((n) => normalizeText(n.name).includes(q)) },
    ).filter((g) => g.niches.length > 0);
  }, [deferred]);

  const count = groups.reduce((acc, g) => acc + g.niches.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-xl">
        <label htmlFor="niche-q" className="sr-only">
          Buscar nicho
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="niche-q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nicho o categoría…"
          className="pl-9"
          autoComplete="off"
        />
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        <span className="tabular-nums">{count}</span> nichos
      </p>
      {groups.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Ningún nicho coincide con “{query}”.</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {groups.map((g) => (
            <section key={g.category.id} className="cv-auto mb-4 break-inside-avoid rounded-xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold">{g.category.name}</h2>
              <ul className="flex flex-col">
                {g.niches.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/nichos/${n.id}`}
                      className="-mx-2 flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none"
                    >
                      <span className="flex-1">{n.name}</span>
                      <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
