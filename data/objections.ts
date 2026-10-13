/**
 * Objeciones frecuentes y cómo responderlas según "Rompe la barrera del no" (Chris Voss):
 * etiquetar la emoción, hacer preguntas calibradas (¿cómo?/¿qué?) y no partir la diferencia.
 */

export interface Objection {
  id: string;
  /** Lo que dice el prospecto */
  phrase: string;
  /** Qué suele significar realmente */
  meaning: string;
  /** Etiqueta: "Parece que… / Suena a que…" + silencio */
  label: string;
  /** Pregunta calibrada para seguir */
  calibrated: string;
}

export const OBJECTIONS: Objection[] = [
  {
    id: "no-time",
    phrase: "No tengo tiempo ahora",
    meaning: "Puede ser real o una forma amable de cortar. Dale control.",
    label: "Parece que justo te agarro en un momento con mil cosas.",
    calibrated: "¿Qué momento te queda mejor para 10 minutos esta semana?",
  },
  {
    id: "expensive",
    phrase: "Es caro / no tenemos presupuesto",
    meaning: "Todavía no ve el costo del problema o no es prioridad.",
    label: "Suena a que el número no cierra con lo que te cuesta hoy el problema.",
    calibrated: "¿Cómo se supone que lo comparo con lo que perdés hoy por [problema]?",
  },
  {
    id: "already-have",
    phrase: "Ya tengo algo / ya lo resolvimos",
    meaning: "Hay un parche. Averiguá si le sirve o solo lo tolera.",
    label: "Parece que ya invertiste tiempo en ordenar esto.",
    calibrated: "¿Qué es lo que más te gusta de cómo lo hacés hoy? ¿Y qué cambiarías?",
  },
  {
    id: "think-about-it",
    phrase: "Lo pienso y te aviso",
    meaning: "Evasiva clásica: falta algo que no te dijo.",
    label: "Da la sensación de que hay algo que todavía no te convence.",
    calibrated: "¿Qué tendría que pasar para que esto tenga sentido para vos?",
  },
  {
    id: "send-info",
    phrase: "Mandame info por mail / WhatsApp",
    meaning: "Forma de terminar la conversación sin decir que no.",
    label: "Parece que preferís verlo tranquilo antes de decidir nada.",
    calibrated: "¿Qué es lo más importante que tendría que tener esa info para que te sirva?",
  },
  {
    id: "talk-partner",
    phrase: "Lo tengo que hablar con mi socio / pareja",
    meaning: "Hay un decisor fuera de la mesa. Pedí conocerlo.",
    label: "Suena a que esta decisión la toman juntos.",
    calibrated: "¿Cómo te parece que lo vería tu socio? ¿Podemos hablar los tres?",
  },
  {
    id: "not-now",
    phrase: "Ahora no es momento, más adelante",
    meaning: "No es prioridad hoy, o hay algo que lo frena.",
    label: "Parece que hay otras cosas más urgentes en este momento.",
    calibrated: "¿Qué tendría que cambiar para que sea el momento?",
  },
  {
    id: "you-are-right",
    phrase: "\"Tenés razón\" / \"Lo voy a intentar\"",
    meaning: "Señal de NO compromiso: te da la razón para que te vayas.",
    label: "Vas a pensar que soy insistente, pero no quiero que sientas que te presiono.",
    calibrated: "¿Cómo sabríamos que esto realmente te está funcionando?",
  },
  {
    id: "ghosting",
    phrase: "Dejó de responder (ghosting)",
    meaning: "Reactivar invitando al \"no\".",
    label: "—",
    calibrated: "¿Abandonaste la idea de resolver [problema]?",
  },
  {
    id: "distrust",
    phrase: "No confío en estas cosas / ya me vendieron humo",
    meaning: "Mala experiencia previa: escuchala entera antes de hablar.",
    label: "Parece que te prometieron mucho y no te cumplieron.",
    calibrated: "¿Qué fue lo que salió mal esa vez?",
  },
];

export const OBJECTIONS_BY_ID = new Map(OBJECTIONS.map((o) => [o.id, o]));
