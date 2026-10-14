"use client";

import { Footprints, TriangleAlert } from "lucide-react";
import { NEXT_STEP_PLAYS, nextStepStage } from "@/data/next-steps";
import { orderProblems } from "@/lib/scoring";
import type { Business, Niche } from "@/lib/types";
import { lowerFirst, problemBody } from "./summary-lines";

/** Guía de cierre: qué compromiso pedir según lo validado y el compromiso ya obtenido */
export function NextStepGuide({ niche, draft, validatedIds }: { niche: Niche; draft: Business; validatedIds: string[] }) {
  const play = NEXT_STEP_PLAYS[nextStepStage(validatedIds.length, draft.commitment)];
  // El problema validado con más interés es el que conviene nombrar
  const top = orderProblems(niche.problems, draft, validatedIds).find((x) => x.validated)?.problem;
  const solution = top ? niche.solutions.find((s) => s.problemId === top.id) : undefined;
  const fill = (phrase: string) =>
    phrase
      .replace("{valor}", lowerFirst(solution?.value ?? solution?.name ?? "lo que te está complicando"))
      .replace("{problema}", top ? problemBody(top) : "esto te estaba complicando");

  return (
    <section aria-labelledby="next-step-title" className="flex flex-col gap-4 rounded-xl border border-primary/50 bg-primary/5 p-4">
      <div className="flex flex-col gap-1">
        <h3 id="next-step-title" className="flex items-center gap-2 font-semibold">
          <Footprints className="size-4 shrink-0" aria-hidden="true" />
          Próximo paso: {play.title}
        </h3>
        <p className="text-sm text-muted-foreground">{play.intro}</p>
      </div>
      <ol className="flex flex-col gap-3">
        {play.steps.map((step, i) => (
          <li key={step.title} className="flex gap-3 text-sm">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold tabular-nums">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium">{step.title}</p>
              {step.phrase ? (
                <p className="rounded-lg border-l-2 border-primary bg-card px-3 py-2 italic">“{fill(step.phrase)}”</p>
              ) : null}
              {step.tip ? <p className="text-muted-foreground">{step.tip}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      <p className="flex gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>{play.warning}</span>
      </p>
    </section>
  );
}
