import { KEY_PROBLEM_QUESTION_IDS } from "@/data/questions";
import type { Business, Commitment, Signal } from "./types";

export type Verdict = "necesita" | "tal-vez" | "no-necesita" | "sin-datos";

export interface ProblemScore {
  problemId: string;
  facts: number;
  vague: number;
  compliments: number;
  /** ≥1 hecho en "última vez" + ≥1 hecho en costo o parche, o confirmado a mano */
  validated: boolean;
}

export interface BusinessScore {
  score: number;
  verdict: Verdict;
  problems: ProblemScore[];
  validatedProblemIds: string[];
  facts: number;
  vague: number;
  compliments: number;
  evangelistCount: number;
  /** Muchos cumplidos, pocos hechos y sin compromiso (Mom Test, cap. 5) */
  zombie: boolean;
  answered: number;
}

const COMMITMENT_POINTS: Record<Commitment, number> = {
  none: 0,
  time: 10,
  reputation: 20,
  money: 30,
};

const KEY_SET = new Set(KEY_PROBLEM_QUESTION_IDS);

export function scoreBusiness(b: Business): BusinessScore {
  const perProblem = new Map<string, ProblemScore & { lastTime: boolean; costOrTried: boolean }>();
  let facts = 0;
  let vague = 0;
  let compliments = 0;
  let answered = 0;

  const bump = (signal: Signal | null) => {
    if (signal === "fact") facts++;
    else if (signal === "vague") vague++;
    else if (signal === "compliment") compliments++;
  };

  for (const [key, answer] of Object.entries(b.answers)) {
    if (!answer.text.trim() && !answer.signal) continue;
    answered++;
    bump(answer.signal);

    const sep = key.indexOf("::");
    if (sep === -1) continue;
    const questionId = key.slice(0, sep);
    const problemId = key.slice(sep + 2);
    let p = perProblem.get(problemId);
    if (!p) {
      p = { problemId, facts: 0, vague: 0, compliments: 0, validated: false, lastTime: false, costOrTried: false };
      perProblem.set(problemId, p);
    }
    if (answer.signal === "fact") {
      p.facts++;
      if (KEY_SET.has(questionId)) {
        if (questionId === "prob-last-time") p.lastTime = true;
        else p.costOrTried = true;
      }
    } else if (answer.signal === "vague") p.vague++;
    else if (answer.signal === "compliment") p.compliments++;
  }

  for (const id of b.problemsConfirmed) {
    if (!perProblem.has(id)) {
      perProblem.set(id, { problemId: id, facts: 0, vague: 0, compliments: 0, validated: false, lastTime: false, costOrTried: false });
    }
  }

  const confirmed = new Set(b.problemsConfirmed);
  const problems: ProblemScore[] = [];
  const validatedProblemIds: string[] = [];
  for (const p of perProblem.values()) {
    const validated = confirmed.has(p.problemId) || (p.lastTime && p.costOrTried && p.facts > p.compliments);
    problems.push({ problemId: p.problemId, facts: p.facts, vague: p.vague, compliments: p.compliments, validated });
    if (validated) validatedProblemIds.push(p.problemId);
  }

  const evangelistCount = b.evangelist.filter(Boolean).length;
  const problemPoints = Math.min(validatedProblemIds.length, 2) * 20; // máx 40
  const evangelistPoints = evangelistCount * 6; // máx 30
  const commitmentPoints = COMMITMENT_POINTS[b.commitment]; // máx 30
  // Los cumplidos restan: son ruido que da confianza falsa
  const penalty = Math.min(compliments * 3, 15);
  const score = Math.max(0, Math.min(100, problemPoints + evangelistPoints + commitmentPoints - penalty));

  const zombie = b.commitment === "none" && compliments > 0 && compliments >= facts;

  let verdict: Verdict;
  if (answered === 0 && evangelistCount === 0 && b.commitment === "none") verdict = "sin-datos";
  else if (validatedProblemIds.length === 0) verdict = "no-necesita";
  else if (score >= 65 && b.commitment !== "none") verdict = "necesita";
  // Hay dolor validado pero falta evidencia o compromiso
  else verdict = "tal-vez";

  return {
    score,
    verdict,
    problems,
    validatedProblemIds,
    facts,
    vague,
    compliments,
    evangelistCount,
    zombie,
    answered,
  };
}

export const VERDICT_META: Record<Verdict, { label: string; description: string }> = {
  necesita: {
    label: "Necesita la solución",
    description: "Problema validado con hechos, perfil de early evangelist y compromiso concreto.",
  },
  "tal-vez": {
    label: "Tal vez",
    description: "Hay dolor real pero falta compromiso o evidencia. Pedí un próximo paso concreto.",
  },
  "no-necesita": {
    label: "No lo necesita (por ahora)",
    description: "No hay problemas validados con hechos: lo tolera o solo fue amable.",
  },
  "sin-datos": {
    label: "Sin evaluar",
    description: "Todavía no hay respuestas clasificadas.",
  },
};
