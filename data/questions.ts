import type { Phase } from "@/lib/types";

/**
 * Banco de preguntas de la entrevista.
 * Basado en docs/README-MOM-TEST.md (hechos del pasado, no opiniones ni futuro)
 * y docs/README-ROMPE-LA-BARRERA-DEL-NO.md (apertura, preguntas calibradas, "así es").
 */

export interface Question {
  id: string;
  phase: Phase;
  text: string;
  /** Para qué sirve la pregunta (lo lee solo el entrevistador) */
  goal: string;
  legend: {
    /** Cómo suena una respuesta que aporta información real */
    good: string;
    /** Señales de que te están mintiendo, siendo amables o hablando en abstracto */
    redFlag: string;
  };
  source: "mom-test" | "voss";
  /** Si es true se repite por cada problema típico del nicho */
  perProblem?: boolean;
  /** Pregunta clave para considerar validado un problema */
  key?: boolean;
  /** En vez de anotar, se marca el match con el nicho: soluciones (valor) o problemas */
  checklist?: "solutions" | "problems";
  /** Se repite como una línea de resumen por cada problema mencionado o validado */
  summary?: boolean;
}

export const PHASES: { id: Phase; title: string; description: string }[] = [
  {
    id: "apertura",
    title: "Apertura",
    description:
      "Bajá la guardia del otro. Informal, voz tranquila y sin presentar tu solución.",
  },
  {
    id: "vida",
    title: "Su negocio y prioridades",
    description:
      "Hablá de su vida, no de tu idea. Dejá que aparezcan los problemas sin sugerirlos.",
  },
  {
    id: "problemas",
    title: "Problemas del nicho",
    description:
      "Validá cada hipótesis con hechos concretos del pasado. Nunca le leas el problema: preguntá por cómo lo hace hoy.",
  },
  {
    id: "decision",
    title: "Presupuesto y decisión",
    description:
      "Quién decide, quién más se ve afectado y cuánto paga hoy por parches.",
  },
  {
    id: "cierre",
    title: "Cierre y compromiso",
    description:
      "Resumí hasta escuchar \"así es\" y pedí un compromiso concreto: tiempo, reputación o dinero.",
  },
];

export const QUESTIONS: Question[] = [
  // ---------- Apertura (Voss) ----------
  {
    id: "open-bad-time",
    phase: "apertura",
    text: "¿Es mal momento para hablar unos minutos?",
    goal: "Invitar al \"no\": quien puede decir que no se siente en control y se relaja.",
    legend: {
      good: "\"No, dale, decime\" o te propone otro horario concreto (día y hora).",
      redFlag: "\"Sí, sí, mandame algo\" sin fecha: es una evasiva, no un sí.",
    },
    source: "voss",
  },
  {
    id: "open-role",
    phase: "apertura",
    text: "Contame un poco de vos: ¿qué hacés vos en el día a día del negocio? ¿Cómo suele ser una semana típica en el negocio?",
    goal: "Saber si hablás con quien decide y ver dónde se va el tiempo, sin mencionar tu solución.",
    legend: {
      good: "Describe tareas, horarios y quién hace qué; deja claro si decide (\"yo me encargo de…\"). Aparecen dolores solos.",
      redFlag: "Mucho \"nosotros/ellos\" y poco \"yo\", o \"normal, tranqui\" → anclá: \"¿y la semana pasada, qué hiciste?\"",
    },
    source: "voss",
  },

  // ---------- Vida y prioridades (Mom Test) ----------
  {
    id: "life-priorities",
    phase: "vida",
    checklist: "solutions",
    text: "¿Cuáles son tus 3 prioridades ahora mismo en el negocio?",
    goal: "Si tu problema no aparece en el top 3, probablemente no es urgente para él.",
    legend: {
      good: "Nombra prioridades concretas (crecer, ordenar cobros, menos ausentes…).",
      redFlag: "Ninguna se relaciona con lo que resolvés → \"lo tolera\", no lo paga.",
    },
    source: "mom-test",
  },
  {
    id: "life-hardest",
    phase: "vida",
    checklist: "problems",
    text: "¿Qué es lo que más tiempo o dolores de cabeza te lleva hoy? ¿Por qué?",
    goal: "Que el problema real aparezca por iniciativa propia.",
    legend: {
      good: "Menciona espontáneamente algún problema típico del nicho, con emoción o ejemplo.",
      redFlag: "Tenés que sugerirle el problema para que diga \"sí, eso también\".",
    },
    source: "mom-test",
  },

  // ---------- Por cada problema del nicho (Mom Test) ----------
  {
    id: "prob-how-today",
    phase: "problemas",
    perProblem: true,
    text: "¿Cómo manejás hoy esta parte del negocio? Mostrame o contame los pasos.",
    goal: "Entender el proceso actual sin mencionar el problema ni tu idea.",
    legend: {
      good: "Describe pasos concretos y herramientas (papel, Excel, WhatsApp, alguien que lo hace).",
      redFlag: "\"Lo tenemos resuelto\" sin detalles, o habla en hipotético (\"en general…\").",
    },
    source: "mom-test",
  },
  {
    id: "prob-last-time",
    phase: "problemas",
    perProblem: true,
    key: true,
    text: "¿Cuándo fue la última vez que te pasó algo así? Contame qué pasó.",
    goal: "Pasar de lo genérico a un hecho específico del pasado.",
    legend: {
      good: "Fecha o caso concreto: \"el martes pasado…\", \"la semana pasada perdí 2 turnos\".",
      redFlag: "\"Siempre/nunca/a veces\", \"podría pasar\": opinión, no hecho. Repreguntá.",
    },
    source: "mom-test",
  },
  {
    id: "prob-cost",
    phase: "problemas",
    perProblem: true,
    key: true,
    text: "¿Cuánto te costó eso? En tiempo, plata o clientes.",
    goal: "Separar problemas que se pagan de los que solo se toleran.",
    legend: {
      good: "Da números o estimaciones concretas (horas por semana, $ perdidos, clientes que se fueron).",
      redFlag: "\"No sé, no tanto\" o minimiza: el problema existe pero no duele.",
    },
    source: "mom-test",
  },
  {
    id: "prob-tried",
    phase: "problemas",
    perProblem: true,
    key: true,
    text: "¿Qué probaste para resolverlo? ¿Qué usás hoy y qué te gusta y qué no?",
    goal: "Quien ya buscó o armó un parche tiene un problema real (early evangelist).",
    legend: {
      good: "Probó apps, contrató a alguien, armó un Excel o un sistema casero: el dolor es real.",
      redFlag: "Nunca buscó nada → no es prioridad, aunque diga que le molesta.",
    },
    source: "mom-test",
  },
  {
    id: "prob-implications",
    phase: "problemas",
    perProblem: true,
    text: "¿Qué pasa si esto sigue igual los próximos meses?",
    goal: "Medir la urgencia (\"¿qué pasa si no hacen nada?\").",
    legend: {
      good: "Describe consecuencias concretas: pérdida de clientes, no poder crecer, estrés del equipo.",
      redFlag: "\"Nada, seguimos así\": lo tolera. Puede no ser cliente ahora.",
    },
    source: "voss",
  },

  // ---------- Presupuesto y decisión ----------
  {
    id: "dec-current-spend",
    phase: "decision",
    text: "¿Cuánto pagás hoy por resolver esto (herramientas, personal, horas extra)?",
    goal: "Anclar el precio en lo que ya gasta, no en lo que \"pagaría\".",
    legend: {
      good: "Monto real mensual o por caso (\"le pago a una chica X por mes\", \"uso una app de $Y\").",
      redFlag: "\"¿Cuánto saldría lo tuyo?\": no respondas con precio, volvé a lo que gasta hoy.",
    },
    source: "mom-test",
  },
  {
    id: "dec-who",
    phase: "decision",
    text: "Cuando contratás algo para el negocio, ¿cómo lo decidís? ¿Quién más participa?",
    goal: "Conocer al decisor y a los que no están en la mesa.",
    legend: {
      good: "Nombra personas y pasos (\"lo hablo con mi socio\", \"decido yo si es menos de $X\").",
      redFlag: "Vago o \"lo tengo que ver\" sin decir con quién → pedí conocer a esa persona.",
    },
    source: "mom-test",
  },
  {
    id: "dec-team-impact",
    phase: "decision",
    text: "¿Cómo afecta esto al resto de tu equipo?",
    goal: "Descubrir influenciadores y posibles bloqueadores de la implementación.",
    legend: {
      good: "Identifica quién sufre el problema y quién tendría que usar la solución.",
      redFlag: "No sabe o no le importa: riesgo de que el equipo no lo adopte.",
    },
    source: "voss",
  },

  // ---------- Cierre ----------
  {
    id: "close-summary",
    phase: "cierre",
    summary: true,
    text: "Resumí cada problema: \"Entonces, si entendí bien, hoy [proceso] y [lo que eso te trae], ¿correcto?\"",
    goal: "Lograr el \"así es\" en cada uno (no un \"tenés razón\", que es una forma de cortarte). Los validados van primero.",
    legend: {
      good: "\"Así es\", \"exacto\", y agrega más detalles por su cuenta.",
      redFlag: "\"Tenés razón\" o \"sí, puede ser\": todavía no te entendió ni se comprometió.",
    },
    source: "voss",
  },
  {
    id: "close-missing",
    phase: "cierre",
    text: "¿Hay algo que debería haberte preguntado y no te pregunté?",
    goal: "Encontrar \"cisnes negros\": lo que no sabías que no sabías.",
    legend: {
      good: "Agrega información nueva: otro dolor, un plazo, una restricción.",
      redFlag: "\"No, todo bien\" está bien, pero no suma: no lo interpretes como interés.",
    },
    source: "mom-test",
  },
  {
    id: "close-who-else",
    phase: "cierre",
    text: "¿Con quién más debería hablar sobre esto?",
    goal: "Cerrar toda conversación con un posible avance (referidos).",
    legend: {
      good: "Te da nombres concretos o se ofrece a presentarte: compromiso de reputación.",
      redFlag: "\"Te aviso si se me ocurre alguien\": evasiva amable.",
    },
    source: "mom-test",
  },
  {
    id: "close-next-step",
    phase: "cierre",
    text: "¿Cuál sería el próximo paso? (proponé uno concreto: reunión con el socio, prueba, seña)",
    goal: "Toda reunión termina en compromiso o fracasó.",
    legend: {
      good: "Acepta una fecha, te presenta al decisor, pide presupuesto o deja una seña.",
      redFlag: "\"Avisame cuando lo tengas\" / \"lo pienso\": cumplido + evasiva. Cliente zombi.",
    },
    source: "mom-test",
  },
];

export const QUESTIONS_BY_PHASE: Record<Phase, Question[]> = PHASES.reduce(
  (acc, p) => {
    acc[p.id] = QUESTIONS.filter((q) => q.phase === p.id);
    return acc;
  },
  {} as Record<Phase, Question[]>,
);

export const PER_PROBLEM_QUESTIONS = QUESTIONS_BY_PHASE.problemas;
export const KEY_PROBLEM_QUESTION_IDS = PER_PROBLEM_QUESTIONS.filter((q) => q.key).map(
  (q) => q.id,
);

export const answerKey = (questionId: string, problemId?: string) =>
  problemId ? `${questionId}::${problemId}` : questionId;

export const EVANGELIST_CRITERIA = [
  "Tiene el problema",
  "Sabe que lo tiene",
  "Buscó activamente una solución",
  "Armó algún parche o solución propia",
  "Tiene (o maneja) presupuesto",
] as const;

export const COMMITMENT_OPTIONS = [
  {
    id: "none",
    label: "Ninguno",
    description: "Cumplidos o \"avisame\". Sin compromiso no hay cliente.",
  },
  {
    id: "time",
    label: "Tiempo",
    description: "Agendó otra reunión con objetivo claro, prueba o revisión.",
  },
  {
    id: "reputation",
    label: "Reputación",
    description: "Te presenta al decisor, socio o a otros colegas.",
  },
  {
    id: "money",
    label: "Dinero",
    description: "Seña, pre-compra o carta de intención.",
  },
] as const;

export const SIGNAL_OPTIONS = [
  {
    id: "fact",
    label: "Hecho concreto",
    hint: "Pasado, específico, con números o casos",
  },
  {
    id: "vague",
    label: "Vago / genérico",
    hint: "\"Siempre\", \"a veces\", \"en general\"",
  },
  {
    id: "compliment",
    label: "Cumplido / futuro",
    hint: "\"Qué buena idea\", \"lo usaría\", \"pagaría\"",
  },
] as const;

export const SUMMARY_REPLY_OPTIONS = [
  { id: "yes", label: "Así es", hint: "Lo confirma y suma detalles: cuenta como hecho" },
  { id: "maybe", label: "Puede ser", hint: "\"Tenés razón\", \"sí, puede ser\": todavía no te entendió" },
  { id: "no", label: "No", hint: "No le pasa así: el problema no queda validado" },
] as const;

export const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));
