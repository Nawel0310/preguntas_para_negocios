import { KEY_PROBLEM_QUESTION_IDS, QUESTION_IDS } from "@/data/questions";
import type { Business, Commitment, Problem, Signal } from "./types";

export type Verdict = "necesita" | "tal-vez" | "no-necesita" | "sin-datos";

export interface ProblemScore {
  problemId: string;
  facts: number;
  vague: number;
  compliments: number;
  /** ≥1 hecho en "última vez" + ≥1 hecho en costo o parche, o confirmado a mano */
  validated: boolean;
  /** 0-2: mencionó el problema y/o eligió la solución como prioridad */
  interest: number;
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

/** Mencionó el problema (+1) y eligió su solución como prioridad (+1): ambos pesan más que uno solo */
export function interestOf(b: Business, problemId: string): number {
  return Number(b.problemsMentioned.includes(problemId)) + Number(b.solutionsWanted.includes(problemId));
}

/** Validados primero, después por interés y por último en el orden del nicho */
export function orderProblems(problems: Problem[], b: Business, validatedIds: string[]) {
  const validated = new Set(validatedIds);
  return problems
    .map((problem, index) => ({ problem, index, validated: validated.has(problem.id), interest: interestOf(b, problem.id) }))
    .toSorted((x, y) => Number(y.validated) - Number(x.validated) || y.interest - x.interest || x.index - y.index);
}

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

  // Los problemIds llevan el nicho como prefijo: lo que quedó de otro nicho no cuenta
  const prefix = `${b.nicheId}--`;
  const inNiche = (problemId: string) => problemId.startsWith(prefix);

  const entry = (problemId: string) => {
    let p = perProblem.get(problemId);
    if (!p) {
      p = { problemId, facts: 0, vague: 0, compliments: 0, validated: false, interest: 0, lastTime: false, costOrTried: false };
      perProblem.set(problemId, p);
    }
    return p;
  };

  for (const [key, answer] of Object.entries(b.answers)) {
    if (!answer.text.trim() && !answer.signal) continue;
    const sep = key.indexOf("::");
    const questionId = sep === -1 ? key : key.slice(0, sep);
    // Respuestas de preguntas que ya no existen (prospectos viejos): no suman ruido
    if (!QUESTION_IDS.has(questionId)) continue;
    if (sep !== -1 && !inNiche(key.slice(sep + 2))) continue;
    answered++;
    bump(answer.signal);

    if (sep === -1) continue;
    const p = entry(key.slice(sep + 2));
    if (answer.signal === "fact") {
      p.facts++;
      if (KEY_SET.has(questionId)) {
        if (questionId === "prob-last-time") p.lastTime = true;
        else p.costOrTried = true;
      }
    } else if (answer.signal === "vague") p.vague++;
    else if (answer.signal === "compliment") p.compliments++;
  }

  // "Así es" en el resumen de cierre cuenta como un hecho más para ese problema
  let summaryYes = 0;
  for (const [id, reply] of Object.entries(b.summaryReplies)) {
    if (!inNiche(id)) continue;
    answered++;
    if (reply === "yes") {
      summaryYes++;
      facts++;
      entry(id).facts++;
    } else if (reply === "maybe") {
      vague++;
      entry(id).vague++;
    } else entry(id);
  }

  for (const id of [...b.problemsConfirmed, ...b.problemsMentioned, ...b.solutionsWanted]) if (inNiche(id)) entry(id);

  const confirmed = new Set(b.problemsConfirmed);
  let pairsBoth = 0;
  const problems: ProblemScore[] = [];
  const validatedProblemIds: string[] = [];
  for (const p of perProblem.values()) {
    const denied = b.summaryReplies[p.problemId] === "no";
    const validated =
      confirmed.has(p.problemId) || (!denied && p.lastTime && p.costOrTried && p.facts > p.compliments);
    const interest = interestOf(b, p.problemId);
    if (interest === 2) pairsBoth++;
    problems.push({ problemId: p.problemId, facts: p.facts, vague: p.vague, compliments: p.compliments, validated, interest });
    if (validated) validatedProblemIds.push(p.problemId);
  }

  const evangelistCount = b.evangelist.filter(Boolean).length;
  const problemPoints = Math.min(validatedProblemIds.length, 2) * 20; // máx 40
  const evangelistPoints = evangelistCount * 6; // máx 30
  const commitmentPoints = COMMITMENT_POINTS[b.commitment]; // máx 30
  // Problema + solución marcados y cada "así es" del resumen: señal de interés real (máx 15)
  const interestPoints = Math.min((pairsBoth + summaryYes) * 5, 15);
  // Los cumplidos restan: son ruido que da confianza falsa
  const penalty = Math.min(compliments * 3, 15);
  const score = Math.max(0, Math.min(100, problemPoints + evangelistPoints + commitmentPoints + interestPoints - penalty));

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
