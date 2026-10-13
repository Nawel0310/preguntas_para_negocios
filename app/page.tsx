import Link from "next/link";
import { BookOpen, Ear, History, MessageCircleOff, Plus, ShieldQuestion } from "lucide-react";
import { DashboardStats } from "@/components/business/dashboard-stats";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RULES = [
  {
    Icon: MessageCircleOff,
    title: "Hablá de su vida, no de tu idea",
    text: "Si nunca mencionás tu solución, nadie te puede mentir sobre ella.",
  },
  {
    Icon: History,
    title: "Hechos del pasado, no opiniones",
    text: "\"¿Cuándo fue la última vez?\" vale más que \"¿lo usarías?\".",
  },
  {
    Icon: Ear,
    title: "Hablá menos, escuchá más",
    text: "Etiquetá emociones y usá preguntas calibradas: ¿cómo?, ¿qué?",
  },
  {
    Icon: ShieldQuestion,
    title: "Toda reunión termina en compromiso",
    text: "Tiempo, reputación o dinero. Sin eso, es un cliente zombi.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <p className="text-sm font-medium text-muted-foreground">Validación de prospectos · Mom Test + Voss</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] sm:text-5xl">
          Descubrí si cada negocio <span className="gradient-text">realmente necesita</span> tu solución
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Elegí el nicho, seguí el guion de preguntas y clasificá cada respuesta. El veredicto separa el dolor real de los
          cumplidos amables.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/negocios/nuevo" className={buttonClasses("primary", "lg")}>
            <Plus aria-hidden="true" /> Nuevo prospecto
          </Link>
          <Link href="/nichos" className={buttonClasses("outline", "lg")}>
            <BookOpen aria-hidden="true" /> Explorar nichos
          </Link>
        </div>
      </section>

      <DashboardStats />

      <section aria-labelledby="reglas" className="flex flex-col gap-3">
        <h2 id="reglas" className="text-lg font-semibold">
          Reglas de oro antes de cada entrevista
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(({ Icon, title, text }) => (
            <Card key={title} className="flex flex-col gap-2 p-4">
              <span className="grid size-9 place-items-center rounded-lg bg-secondary/15 text-[hsl(246_60%_45%)] dark:text-secondary" aria-hidden="true">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
