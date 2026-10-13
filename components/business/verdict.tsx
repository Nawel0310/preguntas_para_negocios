import { CircleCheck, CircleDashed, CircleHelp, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { VERDICT_META, type Verdict } from "@/lib/scoring";

const TONE = {
  necesita: "success",
  "tal-vez": "warning",
  "no-necesita": "danger",
  "sin-datos": "neutral",
} as const;

const ICON = {
  necesita: CircleCheck,
  "tal-vez": CircleHelp,
  "no-necesita": CircleX,
  "sin-datos": CircleDashed,
} as const;

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const Icon = ICON[verdict];
  return (
    <Badge tone={TONE[verdict]} className={className}>
      <Icon aria-hidden="true" />
      {VERDICT_META[verdict].label}
    </Badge>
  );
}

export function ScoreMeter({ score, className }: { score: number; className?: string }) {
  const color = score >= 65 ? "bg-emerald-500" : score >= 30 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="meter"
        aria-label="Puntaje de validación"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full w-full origin-left rounded-full transition-transform duration-300 ease-out", color)}
          style={{ transform: `scaleX(${score / 100})` }}
        />
      </div>
      <span className="w-12 text-right text-sm font-semibold tabular-nums">{score}/100</span>
    </div>
  );
}
