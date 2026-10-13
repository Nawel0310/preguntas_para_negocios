// ---------- Catálogo de nichos (generado desde el docx) ----------

export type Effectiveness = "alta" | "media" | "baja";

export interface ContactChannel {
  channel: string;
  effectiveness: Effectiveness;
  tip: string;
}

export interface Problem {
  id: string;
  text: string;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  resolves: string;
  deliverables: string[];
  priceMin: number;
  priceMax: number;
  problemId?: string;
}

export interface Niche {
  id: string;
  categoryId: string;
  name: string;
  contacts: ContactChannel[];
  contactTip: string;
  problems: Problem[];
  solutions: Solution[];
}

export interface Category {
  id: string;
  name: string;
}

export interface NicheSummary {
  id: string;
  name: string;
  categoryId: string;
}

export interface NicheIndex {
  categories: Category[];
  niches: NicheSummary[];
}

// ---------- Entrevista ----------

export type Phase = "apertura" | "vida" | "problemas" | "decision" | "cierre";

/** Cómo clasifica el entrevistador cada respuesta (Mom Test) */
export type Signal = "fact" | "vague" | "compliment";

export interface Answer {
  text: string;
  signal: Signal | null;
}

export type Commitment = "none" | "time" | "reputation" | "money";

export type InterviewMode = "presencial" | "online";

export interface ObjectionEntry {
  id: string;
  note: string;
}

export interface Business {
  id: string;
  name: string;
  nicheId: string;
  contactName: string;
  contactChannel: string;
  interviewMode: InterviewMode;
  /** clave: `${questionId}` o `${questionId}::${problemId}` para preguntas por problema */
  answers: Record<string, Answer>;
  /** problemas que el negocio mencionó por iniciativa propia o que confirmó con hechos */
  problemsConfirmed: string[];
  /** checklist early evangelist (5 ítems, cap. 5 Mom Test) */
  evangelist: boolean[];
  commitment: Commitment;
  commitmentNote: string;
  objections: ObjectionEntry[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportFile {
  app: "preguntas-para-negocios";
  version: 1;
  exportedAt: string;
  businesses: Business[];
}
