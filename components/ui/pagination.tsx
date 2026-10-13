import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

const itemCls =
  "grid h-10 min-w-10 place-items-center rounded-lg px-2 text-sm font-medium tabular-nums transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1">
      <button
        type="button"
        className={cn(itemCls, "hover:bg-muted")}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Página ${p}`}
            className={cn(itemCls, p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(itemCls, "hover:bg-muted")}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
