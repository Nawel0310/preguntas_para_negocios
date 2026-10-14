"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { Building2, Download, Eye, FilterX, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ListSkeleton } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { businessEditHref, businessHref } from "@/lib/routes";
import { formatDate } from "@/lib/format";
import { CATEGORY_BY_ID, NICHE_BY_ID, NICHES_BY_CATEGORY, nicheName, normalizeText } from "@/lib/niches";
import { scoreBusiness, VERDICT_META, type Verdict } from "@/lib/scoring";
import { deleteBusinesses, getBusinesses, replaceAll, useBusinesses, useHydrated } from "@/lib/storage";
import { downloadJson, mergeBusinesses, parseImport, type MergeResult } from "@/lib/transfer";
import type { Business } from "@/lib/types";
import { ScoreMeter, VerdictBadge } from "./verdict";

const PAGE_SIZE = 10;
const SORTS = {
  recientes: { label: "Más recientes", fn: (a: Row, b: Row) => Date.parse(b.b.updatedAt) - Date.parse(a.b.updatedAt) },
  antiguos: { label: "Más antiguos", fn: (a: Row, b: Row) => Date.parse(a.b.updatedAt) - Date.parse(b.b.updatedAt) },
  nombre: { label: "Nombre (A–Z)", fn: (a: Row, b: Row) => a.b.name.localeCompare(b.b.name, "es") },
  puntaje: { label: "Mayor puntaje", fn: (a: Row, b: Row) => b.s.score - a.s.score },
} as const;
type SortId = keyof typeof SORTS;

interface Row {
  b: Business;
  s: ReturnType<typeof scoreBusiness>;
  search: string;
  categoryId: string;
}

export function BusinessList() {
  const hydrated = useHydrated();
  const businesses = useBusinesses();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const [, startTransition] = useTransition();

  // ---------- Estado de filtros en la URL (compartible y se conserva al volver) ----------
  const nicho = params.get("nicho") ?? "";
  const cat = params.get("cat") ?? "";
  const veredicto = (params.get("veredicto") ?? "") as Verdict | "";
  const orden = (params.get("orden") ?? "recientes") as SortId;
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);

  const setParams = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (resetPage && !("page" in patch)) next.delete("page");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Sincroniza la búsqueda con la URL con un pequeño debounce
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (query.trim() === current) return;
    const t = setTimeout(() => setParams({ q: query.trim() || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // ---------- Datos derivados ----------
  const rows = useMemo<Row[]>(
    () =>
      businesses.map((b) => ({
        b,
        s: scoreBusiness(b),
        search: normalizeText(`${b.name} ${b.contactName} ${nicheName(b.nicheId)}`),
        categoryId: NICHE_BY_ID.get(b.nicheId)?.categoryId ?? "",
      })),
    [businesses],
  );

  const filtered = useMemo(() => {
    const q = normalizeText(deferredQuery.trim());
    const out = rows.filter(
      (r) =>
        (!q || r.search.includes(q)) &&
        (!nicho || r.b.nicheId === nicho) &&
        (!cat || r.categoryId === cat) &&
        (!veredicto || r.s.verdict === veredicto),
    );
    return out.sort((SORTS[orden] ?? SORTS.recientes).fn);
  }, [rows, deferredQuery, nicho, cat, veredicto, orden]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Nichos que realmente tienen negocios cargados (filtro más útil que 138 opciones)
  const usedNiches = useMemo(() => {
    const ids = new Set(businesses.map((b) => b.nicheId));
    return NICHES_BY_CATEGORY.map((g) => ({ ...g, niches: g.niches.filter((n) => ids.has(n.id) && (!cat || g.category.id === cat)) })).filter(
      (g) => g.niches.length > 0,
    );
  }, [businesses, cat]);
  const usedCategories = useMemo(() => {
    const ids = new Set(rows.map((r) => r.categoryId));
    return [...ids].map((id) => CATEGORY_BY_ID.get(id)).filter((c) => c !== undefined);
  }, [rows]);

  const hasFilters = !!(query || nicho || cat || veredicto);

  // ---------- Selección ----------
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const existingIds = useMemo(() => new Set(businesses.map((b) => b.id)), [businesses]);
  const selectedIds = [...selected].filter((id) => existingIds.has(id));
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.b.id));
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of pageRows) {
        if (allPageSelected) next.delete(r.b.id);
        else next.add(r.b.id);
      }
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // ---------- Eliminar ----------
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const confirmDelete = () => {
    if (!toDelete) return;
    deleteBusinesses(toDelete);
    setSelected((prev) => new Set([...prev].filter((id) => !toDelete.includes(id))));
    toast(toDelete.length === 1 ? "Negocio eliminado." : `${toDelete.length} negocios eliminados.`);
    setToDelete(null);
  };

  // ---------- Exportar ----------
  const exportList = (list: Business[], label: string) => {
    if (list.length === 0) return;
    downloadJson(list);
    toast(`Exportaste ${list.length} ${list.length === 1 ? "negocio" : "negocios"} (${label}).`);
  };

  // ---------- Importar ----------
  const fileRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<
    (MergeResult & { invalid: number; fileName: string; incoming: Business[] }) | null
  >(null);
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { businesses: incoming, invalid } = parseImport(await file.text());
      const result = mergeBusinesses(getBusinesses(), incoming);
      setImportPreview({ ...result, invalid, fileName: file.name, incoming });
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo leer el archivo.", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const confirmImport = () => {
    if (!importPreview) return;
    // Se recalcula contra el estado actual por si cambió mientras el diálogo estaba abierto
    try {
      const result = mergeBusinesses(getBusinesses(), importPreview.incoming);
      replaceAll(result.merged);
      toast(`Importación lista: ${result.added} agregados, ${result.replaced} actualizados.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo importar.", "error");
    }
    setImportPreview(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Negocios</h1>
          <p className="text-muted-foreground">
            {hydrated ? (
              <>
                <span className="tabular-nums">{businesses.length}</span> prospectos guardados en este navegador
              </>
            ) : (
              "Cargando…"
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" /> Importar JSON
          </Button>
          <Button variant="outline" onClick={() => exportList(businesses, "todos")} disabled={businesses.length === 0}>
            <Download aria-hidden="true" /> Exportar todos
          </Button>
          <Link href="/negocios/nuevo" className={buttonClasses("primary")}>
            <Plus aria-hidden="true" /> Nuevo
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div role="search" className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <label htmlFor="f-q" className="sr-only">
            Buscar por nombre
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="f-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, contacto o nicho…"
            className="pl-9"
            autoComplete="off"
          />
        </div>
        <FilterSelect id="f-cat" label="Categoría" value={cat} onChange={(v) => setParams({ cat: v || null, nicho: null })}>
          <option value="">Todas las categorías</option>
          {usedCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect id="f-nicho" label="Nicho" value={nicho} onChange={(v) => setParams({ nicho: v || null })}>
          <option value="">Todos los nichos</option>
          {usedNiches.map((g) => (
            <optgroup key={g.category.id} label={g.category.name}>
              {g.niches.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </optgroup>
          ))}
        </FilterSelect>
        <FilterSelect id="f-veredicto" label="Veredicto" value={veredicto} onChange={(v) => setParams({ veredicto: v || null })}>
          <option value="">Todos los veredictos</option>
          {(Object.keys(VERDICT_META) as Verdict[]).map((v) => (
            <option key={v} value={v}>
              {VERDICT_META[v].label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect id="f-orden" label="Orden" value={orden} onChange={(v) => setParams({ orden: v === "recientes" ? null : v }, false)}>
          {(Object.keys(SORTS) as SortId[]).map((s) => (
            <option key={s} value={s}>
              {SORTS[s].label}
            </option>
          ))}
        </FilterSelect>
      </div>

      {/* Barra de selección */}
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-secondary/50 bg-secondary/10 p-3 text-sm" role="region" aria-label="Acciones sobre la selección">
          <span className="mr-auto font-medium tabular-nums">{selectedIds.length} seleccionados</span>
          <Button size="sm" variant="outline" onClick={() => exportList(businesses.filter((b) => selected.has(b.id)), "selección")}>
            <Download aria-hidden="true" /> Exportar
          </Button>
          <Button size="sm" variant="outline" className="text-red-700 dark:text-red-400" onClick={() => setToDelete(selectedIds)}>
            <Trash2 aria-hidden="true" /> Eliminar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Limpiar
          </Button>
        </div>
      ) : null}

      {!hydrated ? (
        <ListSkeleton />
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title="No hay negocios cargados"
          description="Creá tu primer prospecto o importá un JSON exportado anteriormente."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/negocios/nuevo" className={buttonClasses("primary")}>
                <Plus aria-hidden="true" /> Nuevo prospecto
              </Link>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload aria-hidden="true" /> Importar JSON
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FilterX />}
          title="Ningún negocio coincide"
          description="Probá con otro nombre o quitá algunos filtros."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setParams({ q: null, nicho: null, cat: null, veredicto: null });
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" checked={allPageSelected} onChange={togglePage} className="size-5 accent-[hsl(var(--primary))]" />
              Seleccionar página
            </label>
            <span className="tabular-nums">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
              {hasFilters ? " (filtrado)" : ""}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {pageRows.map(({ b, s }) => (
              <li
                key={b.id}
                className={cn(
                  "cv-auto flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors duration-150 sm:flex-row sm:items-center",
                  selected.has(b.id) ? "border-secondary/60" : "border-border",
                )}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(b.id)}
                    onChange={() => toggleOne(b.id)}
                    aria-label={`Seleccionar ${b.name}`}
                    className="mt-1 size-5 shrink-0 accent-[hsl(var(--primary))]"
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={businessHref(b.id)} className="block truncate font-semibold hover:underline focus-visible:underline focus-visible:outline-none">
                      {b.name}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">
                      {nicheName(b.nicheId)} · {formatDate(b.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pl-8 sm:w-80 sm:flex-nowrap sm:pl-0">
                  <VerdictBadge verdict={s.verdict} />
                  <ScoreMeter score={s.score} className="min-w-32 flex-1" />
                </div>
                <div className="flex gap-1 pl-8 sm:pl-0">
                  <Link href={businessHref(b.id)} className={buttonClasses("ghost", "icon")} aria-label={`Ver ${b.name}`} title="Ver">
                    <Eye aria-hidden="true" />
                  </Link>
                  <Link href={businessEditHref(b.id)} className={buttonClasses("ghost", "icon")} aria-label={`Editar ${b.name}`} title="Editar">
                    <Pencil aria-hidden="true" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete([b.id])}
                    aria-label={`Eliminar ${b.name}`}
                    title="Eliminar"
                    className="text-red-700 dark:text-red-400"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={currentPage} totalPages={totalPages} onChange={(p) => setParams({ page: p > 1 ? String(p) : null }, false)} />
        </div>
      )}

      <Dialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={toDelete && toDelete.length > 1 ? `¿Eliminar ${toDelete.length} negocios?` : "¿Eliminar este negocio?"}
        description="Se borrarán con todas sus respuestas de este navegador. No se puede deshacer, salvo que tengas un JSON exportado."
        footer={
          <>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 aria-hidden="true" /> Eliminar
            </Button>
          </>
        }
      />

      <Dialog
        open={importPreview !== null}
        onClose={() => setImportPreview(null)}
        title="Confirmar importación"
        description={importPreview ? `Archivo: ${importPreview.fileName}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setImportPreview(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmImport} disabled={!importPreview || importPreview.added + importPreview.replaced === 0}>
              <Upload aria-hidden="true" /> Importar
            </Button>
          </>
        }
      >
        {importPreview ? (
          <div className="flex flex-col gap-3 text-sm">
            <dl className="grid grid-cols-2 gap-2">
              <ImportStat label="Nuevos (se agregan)" value={importPreview.added} />
              <ImportStat label="Repetidos más nuevos (reemplazan)" value={importPreview.replaced} />
              <ImportStat label="Repetidos más viejos (se ignoran)" value={importPreview.skipped} />
              <ImportStat label="Inválidos" value={importPreview.invalid} />
            </dl>
            <p className="text-muted-foreground">
              Total después de importar: <strong className="tabular-nums text-foreground">{importPreview.merged.length}</strong> negocios.
              Si un nombre se repite, se conserva la versión con fecha de actualización más reciente.
            </p>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

function ImportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </Select>
    </div>
  );
}
