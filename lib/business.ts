import type { Answer, Business, Commitment, InterviewMode, ObjectionEntry, Signal, SummaryReply } from "./types";

const SIGNALS = new Set<Signal>(["fact", "vague", "compliment"]);
const COMMITMENTS = new Set<Commitment>(["none", "time", "reputation", "money"]);
const REPLIES = new Set<SummaryReply>(["yes", "maybe", "no"]);

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

const isoOr = (v: unknown, fallback: string) => {
  if (typeof v !== "string") return fallback;
  const t = Date.parse(v);
  return Number.isNaN(t) ? fallback : new Date(t).toISOString();
};

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createBusiness(partial: Partial<Business> = {}): Business {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: "",
    nicheId: "",
    contactName: "",
    contactChannel: "",
    interviewMode: "presencial",
    answers: {},
    problemsMentioned: [],
    solutionsWanted: [],
    summaryReplies: {},
    problemsConfirmed: [],
    evangelist: [false, false, false, false, false],
    commitment: "none",
    commitmentNote: "",
    objections: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** Valida y completa un objeto desconocido (localStorage o JSON importado). null si no sirve. */
export function normalizeBusiness(input: unknown): Business | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const name = str(o.name).trim();
  if (!name) return null;

  const now = new Date().toISOString();
  const answers: Record<string, Answer> = {};
  if (o.answers && typeof o.answers === "object") {
    for (const [k, v] of Object.entries(o.answers as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const a = v as Record<string, unknown>;
      const signal = SIGNALS.has(a.signal as Signal) ? (a.signal as Signal) : null;
      answers[k] = { text: str(a.text), signal };
    }
  }

  const evangelist = Array.from({ length: 5 }, (_, i) =>
    Array.isArray(o.evangelist) ? Boolean(o.evangelist[i]) : false,
  );

  const objections: ObjectionEntry[] = Array.isArray(o.objections)
    ? o.objections
        .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
        .map((x) => ({ id: str(x.id), note: str(x.note) }))
        .filter((x) => x.id)
    : [];

  const summaryReplies: Record<string, SummaryReply> = {};
  if (o.summaryReplies && typeof o.summaryReplies === "object") {
    for (const [k, v] of Object.entries(o.summaryReplies as Record<string, unknown>)) {
      if (REPLIES.has(v as SummaryReply)) summaryReplies[k] = v as SummaryReply;
    }
  }

  const createdAt = isoOr(o.createdAt, now);
  return {
    id: str(o.id) || newId(),
    name,
    nicheId: str(o.nicheId),
    contactName: str(o.contactName),
    contactChannel: str(o.contactChannel),
    interviewMode: (o.interviewMode === "online" ? "online" : "presencial") as InterviewMode,
    answers,
    problemsMentioned: stringList(o.problemsMentioned),
    solutionsWanted: stringList(o.solutionsWanted),
    summaryReplies,
    problemsConfirmed: stringList(o.problemsConfirmed),
    evangelist,
    commitment: COMMITMENTS.has(o.commitment as Commitment) ? (o.commitment as Commitment) : "none",
    commitmentNote: str(o.commitmentNote),
    objections,
    notes: str(o.notes),
    createdAt,
    updatedAt: isoOr(o.updatedAt, createdAt),
  };
}

const stringList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Clave para detectar duplicados por nombre: sin espacios extra, minúsculas y sin acentos */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
