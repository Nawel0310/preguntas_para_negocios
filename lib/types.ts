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
  /** Proceso actual en 2.ª persona, para el resumen: "tomás turnos por WhatsApp" */
  process?: string;
  /** Lo que ese proceso le trae: "se te pisan dos clientes a la misma hora" */
  pain?: string;
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
  /** Valor que aporta, en palabras del cliente: "Que no se pisen los turnos" */
  value?: string;
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

/** Respuesta a cada línea del resumen de cierre ("así es" / "puede ser" / "no") */
export type SummaryReply = "yes" | "maybe" | "no";

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
  /** dolores conocidos del nicho que el cliente mencionó por su cuenta */
  problemsMentioned: string[];
  /** problemIds cuya solución eligió como prioridad (se guarda por problema: relación 1:1) */
  solutionsWanted: string[];
  /** respuesta a cada línea del resumen de cierre, por problemId */
  summaryReplies: Record<string, SummaryReply>;
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
