"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SUMMARY_REPLY_OPTIONS } from "@/data/questions";
import { cn } from "@/lib/cn";
import { orderProblems } from "@/lib/scoring";
import type { Business, Niche, Problem, SummaryReply } from "@/lib/types";

const REPLY_STYLES: Record<SummaryReply, string> = {
  yes: "aria-checked:border-emerald-500 aria-checked:bg-emerald-500/15 aria-checked:text-emerald-800 dark:aria-checked:text-emerald-300",
  maybe: "aria-checked:border-amber-500 aria-checked:bg-amber-500/15 aria-checked:text-amber-800 dark:aria-checked:text-amber-300",
  no: "aria-checked:border-red-500 aria-checked:bg-red-500/15 aria-checked:text-red-800 dark:aria-checked:text-red-300",
};

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** "Entonces, si entendí bien, hoy tomás turnos por WhatsApp y se te pisan…, ¿correcto?" */
export function summaryLine(p: Problem): string {
  const body = p.process && p.pain ? `${p.process} y ${p.pain}` : lowerFirst(p.text.replace(/[.\s]+$/, ""));
  return `“Entonces, si entendí bien, hoy ${body}, ¿correcto?”`;
}

/** Problemas que entran en el resumen: validados o con interés (mencionado / elegido), más los ya respondidos */
export function summaryProblems(niche: Niche, b: Business, validatedIds: string[]) {
  return orderProblems(niche.problems, b, validatedIds).filter(
    (x) => x.validated || x.interest > 0 || b.summaryReplies[x.problem.id],
  );
}

export function SummaryLines({
  niche,
  draft,
  validatedIds,
  onChange,
}: {
  niche: Niche;
  draft: Business;
  validatedIds: string[];
  onChange: (summaryReplies: Business["summaryReplies"]) => void;
}) {
  const lines = summaryProblems(niche, draft, validatedIds);

  if (lines.length === 0) {
    return (
      <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
        Marcá dolores o prioridades, o validá problemas, para armar el resumen.
      </p>
    );
  }

  const setReply = (id: string, reply: SummaryReply) => {
    const next = { ...draft.summaryReplies };
    if (next[id] === reply) delete next[id];
    else next[id] = reply;
    onChange(next);
  };

  return (
    <ol className="flex flex-col gap-3">
      {lines.map(({ problem, validated, interest }) => {
        const reply = draft.summaryReplies[problem.id];
        return (
          <li key={problem.id} className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
            <div className="flex flex-wrap gap-1.5">
              {validated ? (
                <Badge tone="success">
                  <Check aria-hidden="true" /> Validado
                </Badge>
              ) : null}
              {interest === 2 ? <Badge tone="accent">Problema + solución</Badge> : interest === 1 ? <Badge>Mencionado</Badge> : null}
            </div>
            <p className="text-sm leading-relaxed">{summaryLine(problem)}</p>
            <div role="radiogroup" aria-label="Qué respondió" className="flex flex-wrap gap-2">
              {SUMMARY_REPLY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={reply === opt.id}
                  title={opt.hint}
                  onClick={() => setReply(problem.id, opt.id)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border border-border px-3 text-sm transition-colors duration-150",
                    "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    REPLY_STYLES[opt.id],
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
