/**
 * Qué hacer al terminar la entrevista, según cuánto se validó y qué compromiso ya dio.
 * Basado en docs/README-MOM-TEST.md (cap. 5: compromiso y avance, reunión de 30 min)
 * y docs/README-ROMPE-LA-BARRERA-DEL-NO.md ("así es" antes de presentar, preguntas que
 * invitan al "no", "un sí no es nada sin un cómo").
 */

import type { Commitment } from "@/lib/types";

export type NextStepStage = "sin-dolor" | "pedir-reunion" | "pedir-dinero" | "cerrar-como";

export interface NextStep {
  title: string;
  /**
   * Frase para decir tal cual. `{valor}` se reemplaza por el valor de la solución validada
   * ("que no se pisen los turnos") y `{problema}` por su proceso + dolor.
   */
  phrase?: string;
  tip?: string;
}

export interface NextStepPlay {
  title: string;
  intro: string;
  steps: NextStep[];
  /** Señales de que no hubo compromiso real */
  warning: string;
}

export function nextStepStage(validatedCount: number, commitment: Commitment): NextStepStage {
  if (validatedCount === 0) return "sin-dolor";
  if (commitment === "none") return "pedir-reunion";
  if (commitment === "money") return "cerrar-como";
  return "pedir-dinero";
}

export const NEXT_STEP_PLAYS: Record<NextStepStage, NextStepPlay> = {
  "sin-dolor": {
    title: "Todavía no ofrezcas nada",
    intro:
      "No hay ningún problema validado con hechos. Presentar la solución ahora solo te va a dar cumplidos: seguí aprendiendo o cerrá con un referido.",
    steps: [
      {
        title: "Anclá en un hecho concreto antes de irte",
        phrase: "¿Cuándo fue la última vez que te pasó algo así? ¿Qué hiciste?",
        tip: "Si no aparece ningún caso concreto, el problema existe pero no duele: lo tolera.",
      },
      {
        title: "Pedí un referido (compromiso de reputación)",
        phrase: "¿Conocés a alguien de tu rubro a quien esto sí le esté complicando el día?",
      },
      {
        title: "Dejá la puerta abierta sin pedir favores",
        phrase: "¿Sería una molestia si te escribo en unas semanas para contarte qué aprendí hablando con otros?",
      },
    ],
    warning: "Si te dice \"qué buena idea, avisame cuando esté\", es un cumplido: no lo cuentes como interés.",
  },
  "pedir-reunion": {
    title: "Pedí una reunión con fecha (compromiso de tiempo)",
    intro:
      "El problema está validado. Recién ahora tiene sentido nombrar la solución, pero el objetivo de hoy no es venderla: es salir con día y hora para mostrársela.",
    steps: [
      {
        title: "Conseguí el \"así es\" del resumen",
        tip: "Usá las líneas de resumen de arriba. Si responde \"tenés razón\" o \"puede ser\", todavía no te entendió: reformulá.",
      },
      {
        title: "Nombrá la solución en una o dos frases, con sus palabras",
        phrase: "Justamente me dedico a esto: {valor}.",
        tip: "Sin funcionalidades ni precio. Hablá del resultado, no de la tecnología.",
      },
      {
        title: "Proponé la reunión con una pregunta que invite al \"no\"",
        phrase: "¿Sería una mala idea juntarnos media hora la semana que viene y te muestro cómo quedaría para tu negocio?",
        tip: "Que te dé día y hora ahí mismo. \"Mandame algo\" o \"avisame\" no es un sí.",
      },
      {
        title: "Sumá al que decide (compromiso de reputación)",
        phrase: "¿Hay alguien más que debería estar cuando lo veamos?",
        tip: "Socio, secretaria o quien lo va a usar todos los días: si no está en la mesa, puede trabar todo después.",
      },
      {
        title: "Pedí el contacto para confirmar",
        phrase: "¿A qué número te mando la confirmación y un recordatorio el día antes?",
        tip: "El número es el medio, no el compromiso: el compromiso es la fecha.",
      },
    ],
    warning:
      "Para esa reunión llevá una maqueta o prototipo de 1 o 2 días con sus datos reales (sus horarios, sus servicios). No construyas el sistema todavía.",
  },
  "pedir-dinero": {
    title: "En la próxima reunión, pedí dinero (seña o piloto)",
    intro:
      "Ya te dio tiempo o te presentó a alguien. En la reunión de 30 minutos: 5 de confirmar el problema, 10 de mostrar la maqueta y 5 de próximos pasos.",
    steps: [
      {
        title: "Volvé a confirmar el problema antes de mostrar nada",
        phrase: "La última vez me contaste que {problema}. ¿Sigue siendo así?",
      },
      {
        title: "Mostrá la maqueta con sus datos y preguntá, no expliques",
        phrase: "¿Qué parte de esto te sacaría más trabajo en una semana normal?",
      },
      {
        title: "Anclá el precio en lo que ya gasta hoy",
        tip: "Usá lo que respondió en \"¿Cuánto pagás hoy por resolver esto?\": horas, personal, apps o clientes perdidos.",
      },
      {
        title: "Pedí el compromiso de dinero",
        phrase: "Para arrancar pedimos una seña y empezamos con un piloto de un mes. ¿Cómo lo ves?",
        tip: "Alternativas: piloto pago con fecha de inicio, o fecha de decisión con el que decide presente.",
      },
    ],
    warning: "\"Lo pienso\" o \"lo hablo y te aviso\" sin fecha: preguntá \"¿qué tendría que pasar para decidirlo?\" y \"¿con quién lo hablás?\".",
  },
  "cerrar-como": {
    title: "Asegurá el \"cómo\"",
    intro: "Ya hay compromiso de dinero. Un sí no es nada sin un cómo: que el cliente defina cómo se implementa para que el acuerdo se cumpla.",
    steps: [
      {
        title: "Que él defina la implementación",
        phrase: "¿Cómo te imaginás que arranquemos? ¿Quién de tu equipo lo va a usar primero?",
      },
      {
        title: "Fijá fechas concretas",
        phrase: "¿Qué día te queda bien para cargar los datos juntos?",
      },
      {
        title: "Confirmá el acuerdo tres veces (regla del 3)",
        tip: "Que lo diga de tres formas distintas: un \"sí\", un resumen con sus palabras y una pregunta de \"cómo\".",
      },
      {
        title: "Pedí un testimonio o referido para después",
        phrase: "Si te funciona, ¿me presentarías a otro colega al que le pase lo mismo?",
      },
    ],
    warning: "Señal de alarma: \"lo voy a intentar\" suele significar que no lo va a hacer. Volvé al \"¿cómo?\".",
  },
};
