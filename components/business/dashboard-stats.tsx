"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { nicheName } from "@/lib/niches";
import { scoreBusiness, type Verdict } from "@/lib/scoring";
import { useBusinesses, useHydrated } from "@/lib/storage";
import { VerdictBadge } from "./verdict";

const STATS: { id: Verdict | "total"; label: string; accent: string }[] = [
  { id: "total", label: "Prospectos", accent: "bg-secondary" },
  { id: "necesita", label: "Necesitan", accent: "bg-emerald-500" },
  { id: "tal-vez", label: "Tal vez", accent: "bg-amber-500" },
  { id: "no-necesita", label: "No necesitan", accent: "bg-red-500" },
];

export function DashboardStats() {
  const hydrated = useHydrated();
  const businesses = useBusinesses();

  const { counts, recent } = useMemo(() => {
    const counts: Record<string, number> = { total: businesses.length, necesita: 0, "tal-vez": 0, "no-necesita": 0 };
    const scored = businesses.map((b) => {
      const s = scoreBusiness(b);
      counts[s.verdict] = (counts[s.verdict] ?? 0) + 1;
      return { b, s };
    });
    const recent = scored
      .toSorted((x, y) => Date.parse(y.b.updatedAt) - Date.parse(x.b.updatedAt))
      .slice(0, 5);
    return { counts, recent };
  }, [businesses]);

  return (
    <>
      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.id} className="relative overflow-hidden p-4">
            <span className={`absolute inset-y-0 left-0 w-1 ${s.accent}`} aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {hydrated ? counts[s.id] ?? 0 : <span className="inline-block h-9 w-10 animate-pulse rounded bg-muted align-middle" />}
            </p>
          </Card>
        ))}
      </section>

      <section aria-labelledby="recientes" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recientes" className="text-lg font-semibold">
            Últimos prospectos
          </h2>
          <Link href="/negocios" className={buttonClasses("ghost", "sm")}>
            Ver todos <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        {!hydrated ? (
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<Building2 />}
            title="Todavía no prospectaste ningún negocio"
            description="Cargá el primero, elegí su nicho y respondé la entrevista para saber si realmente necesita tu solución."
            action={
              <Link href="/negocios/nuevo" className={buttonClasses("primary")}>
                <Plus aria-hidden="true" /> Nuevo prospecto
              </Link>
            }
          />
        ) : (
          <Card className="divide-y divide-border">
            {recent.map(({ b, s }) => (
              <Link
                key={b.id}
                href={`/negocios/${b.id}`}
                className="flex flex-col gap-1 p-4 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{b.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {nicheName(b.nicheId)} · {formatDate(b.updatedAt)}
                  </p>
                </div>
                <VerdictBadge verdict={s.verdict} className="self-start sm:self-auto" />
              </Link>
            ))}
          </Card>
        )}
      </section>
    </>
  );
}
