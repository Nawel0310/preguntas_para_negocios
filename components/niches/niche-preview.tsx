import type { Niche } from "@/lib/types";

/** Problemas típicos del nicho con la solución que resuelve cada uno */
export function NichePreview({ niche }: { niche: Niche }) {
  const solutionByProblem = new Map(niche.solutions.map((s) => [s.problemId, s]));
  return (
    <ol className="flex flex-col gap-3">
      {niche.problems.map((p, i) => {
        const s = solutionByProblem.get(p.id);
        return (
          <li key={p.id} className="rounded-lg border border-border bg-background/50 p-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-sm font-medium first-letter:uppercase">{p.text}</p>
                {s ? (
                  <div className="flex flex-col gap-1 rounded-md bg-muted/60 p-2.5 text-sm">
                    <span className="font-medium">→ {s.name}</span>
                    {s.value ? <p className="font-medium text-foreground/80">{s.value}</p> : null}
                    <p className="text-muted-foreground">{s.description}</p>
                    <details className="text-muted-foreground">
                      <summary className="w-fit hover:text-foreground">Qué incluye</summary>
                      <ul className="mt-1.5 list-disc pl-5">
                        {s.deliverables.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
