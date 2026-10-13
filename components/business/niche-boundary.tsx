"use client";

import { Suspense, use, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { loadNiche } from "@/lib/niche-client";
import type { Niche } from "@/lib/types";

function Loader({ id, children }: { id: string; children: (niche: Niche) => ReactNode }) {
  const niche = use(loadNiche(id));
  return children(niche);
}

/** Carga el detalle del nicho bajo demanda y lo pasa como render-prop */
export function WithNiche({
  id,
  children,
  fallback,
}: {
  id: string;
  children: (niche: Niche) => ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border border-red-500/40 p-4 text-sm">
          <p>{error.message}</p>
          <Button size="sm" variant="outline" onClick={reset}>
            Reintentar
          </Button>
        </div>
      )}
    >
      <Suspense fallback={fallback ?? <div className="h-32 animate-pulse rounded-xl bg-muted" />}>
        <Loader id={id}>{children}</Loader>
      </Suspense>
    </ErrorBoundary>
  );
}
