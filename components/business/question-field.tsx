"use client";

import { memo, useId } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { Textarea } from "@/components/ui/field";
import { SIGNAL_OPTIONS, type Question } from "@/data/questions";
import { cn } from "@/lib/cn";
import type { Answer, Signal } from "@/lib/types";

const EMPTY_ANSWER: Answer = { text: "", signal: null };

const SIGNAL_STYLES: Record<Signal, string> = {
  fact: "aria-checked:border-emerald-500 aria-checked:bg-emerald-500/15 aria-checked:text-emerald-800 dark:aria-checked:text-emerald-300",
  vague: "aria-checked:border-amber-500 aria-checked:bg-amber-500/15 aria-checked:text-amber-800 dark:aria-checked:text-amber-300",
  compliment: "aria-checked:border-red-500 aria-checked:bg-red-500/15 aria-checked:text-red-800 dark:aria-checked:text-red-300",
};

export const QuestionField = memo(function QuestionField({
  answerKey,
  question,
  answer = EMPTY_ANSWER,
  onChange,
  index,
}: {
  answerKey: string;
  question: Question;
  answer?: Answer;
  onChange: (key: string, patch: Partial<Answer>) => void;
  index?: number;
}) {
  const id = useId();
  const legendId = `${id}-legend`;
  const goalId = `${id}-goal`;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="font-medium leading-snug">
          {index !== undefined ? <span className="mr-1.5 tabular-nums text-muted-foreground">{index}.</span> : null}
          {question.text}
        </label>
        <p id={goalId} className="text-sm text-muted-foreground">
          {question.goal}
          <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
            {question.source === "voss" ? "Voss" : "Mom Test"}
          </span>
        </p>
      </div>

      <Textarea
        id={id}
        value={answer.text}
        onChange={(e) => onChange(answerKey, { text: e.target.value })}
        placeholder="Anotá lo que dijo, con sus palabras…"
        aria-describedby={`${goalId} ${legendId}`}
        rows={3}
      />

      <div id={legendId} className="grid gap-1.5 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-2 sm:gap-3">
        <p className="flex gap-2">
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>
            <span className="font-medium">Respuesta esperada: </span>
            {question.legend.good}
          </span>
        </p>
        <p className="flex gap-2">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>
            <span className="font-medium">Alerta: </span>
            {question.legend.redFlag}
          </span>
        </p>
      </div>

      <div role="radiogroup" aria-label="Clasificación de la respuesta" className="flex flex-wrap gap-2">
        {SIGNAL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={answer.signal === opt.id}
            title={opt.hint}
            onClick={() => onChange(answerKey, { signal: answer.signal === opt.id ? null : opt.id })}
            className={cn(
              "inline-flex h-9 items-center rounded-full border border-border px-3 text-sm transition-colors duration-150",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              SIGNAL_STYLES[opt.id],
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
});
