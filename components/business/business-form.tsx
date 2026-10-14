"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, CloudCheck, Lightbulb, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ContactStrategy } from "@/components/niches/contact-strategy";
import { NichePicker } from "@/components/niches/niche-picker";
import { NichePreview } from "@/components/niches/niche-preview";
import { OBJECTIONS } from "@/data/objections";
import {
  answerKey,
  COMMITMENT_OPTIONS,
  EVANGELIST_CRITERIA,
  PER_PROBLEM_QUESTIONS,
  PHASES,
  QUESTIONS_BY_PHASE,
} from "@/data/questions";
import { createBusiness, nameKey } from "@/lib/business";
import { cn } from "@/lib/cn";
import { businessHref } from "@/lib/routes";
import { orderProblems, scoreBusiness, VERDICT_META } from "@/lib/scoring";
import { getBusinesses, saveBusiness, useBusinesses } from "@/lib/storage";
import type { Answer, Business, Commitment, Niche, Phase } from "@/lib/types";
import { WithNiche } from "./niche-boundary";
import { NextStepGuide } from "./next-step-guide";
import { PairChecklist } from "./pair-checklist";
import { QuestionField } from "./question-field";
import { SummaryLines } from "./summary-lines";
import { ScoreMeter, VerdictBadge } from "./verdict";

type StepId = "datos" | Phase | "objeciones";

const STEPS: { id: StepId; title: string }[] = [
  { id: "datos", title: "Negocio" },
  ...PHASES.map((p) => ({ id: p.id as StepId, title: p.title })),
  { id: "objeciones", title: "Objeciones y notas" },
];

const CHANNELS = ["Visita presencial", "WhatsApp", "Instagram DM", "Llamada", "Email", "Referido", "LinkedIn", "Otro"];

export function BusinessForm({ initial, defaultNicheId }: { initial?: Business; defaultNicheId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const businesses = useBusinesses();
  const [draft, setDraft] = useState<Business>(() => initial ?? createBusiness({ nicheId: defaultNicheId ?? "" }));
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initial ? initial.updatedAt : null);
  const dirty = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  // ---------- Validación ----------
  const duplicate = useMemo(() => {
    const key = nameKey(draft.name);
    return key ? businesses.some((b) => b.id !== draft.id && nameKey(b.name) === key) : false;
  }, [businesses, draft.name, draft.id]);

  const nameError = !draft.name.trim()
    ? "Ingresá el nombre del negocio."
    : duplicate
      ? "Ya existe un negocio con ese nombre. Editá el existente o usá otro nombre."
      : null;
  const nicheError = draft.nicheId ? null : "Elegí el nicho del negocio.";
  const valid = !nameError && !nicheError;

  // ---------- Edición ----------
  const update = useCallback((patch: Partial<Business>) => {
    dirty.current = true;
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const setAnswer = useCallback((key: string, patch: Partial<Answer>) => {
    dirty.current = true;
    setDraft((d) => {
      const prev = d.answers[key] ?? { text: "", signal: null };
      return { ...d, answers: { ...d.answers, [key]: { ...prev, ...patch } } };
    });
  }, []);

  const persist = useCallback(
    (b: Business) => {
      const stamped = { ...b, name: b.name.trim(), updatedAt: new Date().toISOString() };
      try {
        saveBusiness(stamped);
        dirty.current = false;
        setSavedAt(stamped.updatedAt);
        return true;
      } catch (err) {
        toast(err instanceof Error ? err.message : "No se pudo guardar.", "error");
        return false;
      }
    },
    [toast],
  );

  // Autoguardado: solo si hubo cambios reales (updatedAt decide qué versión gana al importar)
  useEffect(() => {
    if (!dirty.current || !valid) return;
    const t = setTimeout(() => persist(draft), 800);
    return () => clearTimeout(t);
  }, [draft, valid, persist]);

  const score = useMemo(() => scoreBusiness(draft), [draft]);

  const goTo = (i: number) => {
    if (i > 0 && !valid) {
      setTouched(true);
      setStep(0);
      return;
    }
    setStep(i);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const finish = () => {
    if (!valid) {
      setTouched(true);
      setStep(0);
      return;
    }
    // Guardado explícito aunque no haya cambios pendientes
    const exists = getBusinesses().some((b) => b.id === draft.id);
    if (dirty.current || !exists) {
      if (!persist(draft)) return;
    }
    toast(`"${draft.name.trim()}" guardado.`);
    router.push(businessHref(draft.id));
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div ref={topRef} className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <Link href={initial ? businessHref(initial.id) : "/negocios"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> Volver
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">{initial ? `Editar: ${initial.name}` : "Nuevo prospecto"}</h1>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
          {savedAt ? (
            <>
              <CloudCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Guardado automáticamente
            </>
          ) : (
            "Se guarda solo al completar nombre y nicho"
          )}
        </p>
      </div>

      {/* Stepper */}
      <nav aria-label="Pasos de la entrevista" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ol className="flex min-w-max gap-1.5">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full border px-3 text-sm transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  i === step
                    ? "border-transparent bg-foreground text-background"
                    : i < step
                      ? "border-border bg-card text-foreground hover:bg-muted"
                      : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full text-xs font-semibold tabular-nums",
                    i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/30" : "bg-muted",
                  )}
                  aria-hidden="true"
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="text-muted-foreground tabular-nums">
                  {step + 1}/{STEPS.length} ·{" "}
                </span>
                {current.title}
              </CardTitle>
              {current.id !== "datos" && current.id !== "objeciones" ? (
                <p className="text-sm text-muted-foreground">{PHASES.find((p) => p.id === current.id)?.description}</p>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              {current.id === "datos" ? (
                <DataStep draft={draft} update={update} touched={touched} nameError={nameError} nicheError={nicheError} />
              ) : current.id === "problemas" ? (
                draft.nicheId ? (
                  <WithNiche id={draft.nicheId}>
                    {(niche) => (
                      <ProblemsStep niche={niche} draft={draft} validatedIds={score.validatedProblemIds} setAnswer={setAnswer} update={update} />
                    )}
                  </WithNiche>
                ) : null
              ) : current.id === "objeciones" ? (
                <ObjectionsStep draft={draft} update={update} />
              ) : (
                <>
                  {QUESTIONS_BY_PHASE[current.id].map((q, i) => {
                    const field = (children?: ReactNode) => (
                      <QuestionField
                        key={q.id}
                        answerKey={q.id}
                        question={q}
                        answer={draft.answers[q.id]}
                        onChange={setAnswer}
                        index={i + 1}
                        classify={!q.summary}
                      >
                        {children}
                      </QuestionField>
                    );
                    if (!draft.nicheId || (!q.checklist && !q.summary)) return field();
                    return (
                      <WithNiche key={q.id} id={draft.nicheId}>
                        {(niche) =>
                          field(
                            q.summary ? (
                              <SummaryLines
                                niche={niche}
                                draft={draft}
                                validatedIds={score.validatedProblemIds}
                                onChange={(summaryReplies) => update({ summaryReplies })}
                              />
                            ) : (
                              <NicheChecklist kind={q.checklist!} niche={niche} draft={draft} update={update} />
                            ),
                          )
                        }
                      </WithNiche>
                    );
                  })}
                  {current.id === "cierre" ? (
                    <>
                      {draft.nicheId ? (
                        <WithNiche id={draft.nicheId}>
                          {(niche) => <NextStepGuide niche={niche} draft={draft} validatedIds={score.validatedProblemIds} />}
                        </WithNiche>
                      ) : null}
                      <CommitmentBlock draft={draft} update={update} />
                    </>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => goTo(step - 1)} disabled={step === 0}>
              <ArrowLeft aria-hidden="true" /> Anterior
            </Button>
            <div className="flex gap-2">
              {!isLast ? (
                <>
                  <Button variant="ghost" onClick={finish} className="max-sm:hidden">
                    <Save aria-hidden="true" /> Guardar y salir
                  </Button>
                  <Button onClick={() => goTo(step + 1)}>
                    Siguiente <ArrowRight aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <Button onClick={finish}>
                  <Check aria-hidden="true" /> Guardar y ver resultado
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral: resultado en vivo + info del nicho */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resultado en vivo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <VerdictBadge verdict={score.verdict} className="self-start" />
              <ScoreMeter score={score.score} />
              <p className="text-sm text-muted-foreground">{VERDICT_META[score.verdict].description}</p>
              <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <dt className="text-xs text-muted-foreground">Hechos</dt>
                  <dd className="font-semibold tabular-nums">{score.facts}</dd>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <dt className="text-xs text-muted-foreground">Vagas</dt>
                  <dd className="font-semibold tabular-nums">{score.vague}</dd>
                </div>
                <div className="rounded-lg bg-red-500/10 p-2">
                  <dt className="text-xs text-muted-foreground">Cumplidos</dt>
                  <dd className="font-semibold tabular-nums">{score.compliments}</dd>
                </div>
              </dl>
              {score.zombie ? (
                <p className="rounded-lg bg-red-500/10 p-3 text-sm">
                  <strong>Posible cliente zombi:</strong> más cumplidos que hechos y ningún compromiso.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {draft.nicheId ? (
            <details className="group rounded-xl border border-border bg-card shadow-sm" open>
              <summary className="flex min-h-12 items-center justify-between gap-2 px-5 py-3 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                Estrategia de contacto
                <ArrowRight className="size-4 transition-transform duration-200 group-open:rotate-90" aria-hidden="true" />
              </summary>
              <div className="px-5 pb-5">
                <WithNiche id={draft.nicheId}>
                  {(niche) => <ContactStrategy contacts={niche.contacts} tip={niche.contactTip} />}
                </WithNiche>
              </div>
            </details>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function DataStep({
  draft,
  update,
  touched,
  nameError,
  nicheError,
}: {
  draft: Business;
  update: (patch: Partial<Business>) => void;
  touched: boolean;
  nameError: string | null;
  nicheError: string | null;
}) {
  const [blurred, setBlurred] = useState(false);
  const showName = (touched || blurred) && nameError;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Nombre del negocio" htmlFor="b-name" required error={showName ? nameError : null} className="sm:col-span-2">
        <Input
          id="b-name"
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => setBlurred(true)}
          aria-invalid={showName ? true : undefined}
          aria-describedby={showName ? "b-name-error" : undefined}
          placeholder="Ej: Consultorio Dr. Pérez"
          autoComplete="organization"
        />
      </Field>
      <Field
        label="Nicho"
        htmlFor="b-niche"
        required
        error={touched ? nicheError : null}
        hint="Define los problemas típicos que vas a validar."
        className="sm:col-span-2"
      >
        <NichePicker
          id="b-niche"
          value={draft.nicheId}
          onChange={(nicheId) =>
            // Los problemas marcados pertenecen al nicho anterior
            update(
              nicheId === draft.nicheId
                ? { nicheId }
                : {
                    nicheId,
                    // Las respuestas por problema (`pregunta::problemId`) son del nicho anterior
                    answers: Object.fromEntries(Object.entries(draft.answers).filter(([k]) => !k.includes("::"))),
                    problemsMentioned: [],
                    solutionsWanted: [],
                    summaryReplies: {},
                    problemsConfirmed: [],
                  },
            )
          }
          invalid={touched && !!nicheError}
          describedBy={touched && nicheError ? "b-niche-error" : "b-niche-hint"}
        />
      </Field>
      {draft.nicheId ? (
        <details open className="group rounded-xl border border-border bg-card sm:col-span-2">
          <summary className="flex min-h-12 items-center gap-2 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" aria-hidden="true" />
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
              <span className="font-medium">Problemas típicos y soluciones</span>
              <span className="text-sm text-muted-foreground">· para guiarte, no para leérselos</span>
            </span>
          </summary>
          <div className="border-t border-border p-4">
            <WithNiche id={draft.nicheId}>{(niche) => <NichePreview niche={niche} />}</WithNiche>
          </div>
        </details>
      ) : null}
      <Field label="Persona de contacto" htmlFor="b-contact" hint="Con quién hablaste y qué rol tiene.">
        <Input
          id="b-contact"
          value={draft.contactName}
          onChange={(e) => update({ contactName: e.target.value })}
          placeholder="Ej: Laura, dueña"
          autoComplete="name"
        />
      </Field>
      <Field label="Canal de contacto" htmlFor="b-channel">
        <Select id="b-channel" value={draft.contactChannel} onChange={(e) => update({ contactChannel: e.target.value })}>
          <option value="">Sin especificar</option>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <fieldset className="flex flex-col gap-1.5 sm:col-span-2">
        <legend className="mb-1.5 text-sm font-medium">Modalidad de la entrevista</legend>
        <div className="flex gap-2">
          {(["presencial", "online"] as const).map((m) => (
            <label
              key={m}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-4 text-sm capitalize transition-colors duration-150 sm:flex-none",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                draft.interviewMode === m ? "border-foreground/40 bg-muted font-medium" : "border-border hover:bg-muted/60",
              )}
            >
              <input
                type="radio"
                name="interviewMode"
                value={m}
                checked={draft.interviewMode === m}
                onChange={() => update({ interviewMode: m })}
                className="sr-only"
              />
              {m}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-3 rounded-lg border-l-2 border-accent bg-accent/10 p-4 text-sm sm:col-span-2">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-[hsl(272_70%_45%)] dark:text-[hsl(272_95%_78%)]" aria-hidden="true" />
        <p>
          <strong>Antes de empezar:</strong> preguntate “¿qué quiero aprender de esta persona?”. No presentes tu solución:
          las preguntas son sobre su negocio y lo que ya hizo.
        </p>
      </div>
    </div>
  );
}

/** Match de la respuesta con el nicho: soluciones (prioridades) o problemas (dolores) */
function NicheChecklist({
  kind,
  niche,
  draft,
  update,
}: {
  kind: "solutions" | "problems";
  niche: Niche;
  draft: Business;
  update: (patch: Partial<Business>) => void;
}) {
  const solutionByProblem = new Map(niche.solutions.map((s) => [s.problemId, s]));
  if (kind === "solutions") {
    const mentioned = new Set(draft.problemsMentioned);
    return (
      <PairChecklist
        legend="¿Alguna de sus prioridades coincide con lo que resolvemos?"
        hint="Marcá las que nombró él. Si además mencionó el problema, ese par pesa más."
        items={niche.problems.map((p) => {
          const s = solutionByProblem.get(p.id);
          return { id: p.id, label: s?.value ?? s?.name ?? p.text, detail: s?.name, paired: mentioned.has(p.id) };
        })}
        selected={draft.solutionsWanted}
        onChange={(solutionsWanted) => update({ solutionsWanted })}
        pairedLabel="Mencionó el problema"
      />
    );
  }
  const wanted = new Set(draft.solutionsWanted);
  return (
    <PairChecklist
      legend="¿Mencionó alguno de estos dolores del nicho?"
      hint="Marcá solo los que dijo él por su cuenta; no se los sugieras. Van primero en Problemas del nicho."
      items={niche.problems.map((p) => ({ id: p.id, label: p.text, paired: wanted.has(p.id) }))}
      selected={draft.problemsMentioned}
      onChange={(problemsMentioned) => update({ problemsMentioned })}
      pairedLabel="Es prioridad"
    />
  );
}

function ProblemsStep({
  niche,
  draft,
  validatedIds,
  setAnswer,
  update,
}: {
  niche: Niche;
  draft: Business;
  validatedIds: string[];
  setAnswer: (key: string, patch: Partial<Answer>) => void;
  update: (patch: Partial<Business>) => void;
}) {
  const validated = new Set(validatedIds);
  const confirmed = new Set(draft.problemsConfirmed);
  const mentioned = new Set(draft.problemsMentioned);
  const wanted = new Set(draft.solutionsWanted);
  const solutionByProblem = new Map(niche.solutions.map((s) => [s.problemId, s]));
  // Por interés (problema + solución > uno solo), sin reordenar al validar; se conserva el número original
  const ordered = orderProblems(niche.problems, draft, []);
  const anyInterest = ordered.some((x) => x.interest > 0);

  const toggle = (field: "problemsConfirmed" | "problemsMentioned", id: string) => {
    const next = new Set(draft[field]);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ [field]: [...next] });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Estas son <strong className="text-foreground">hipótesis</strong>: no se las leas al cliente. Usalas para guiar la
        conversación hacia “¿cómo lo hacés hoy?” y anclá todo en hechos concretos. Primero van los que mencionó como problema y
        como prioridad, después los que mencionó de una sola forma.
      </p>
      {ordered.map(({ problem, index: pi, interest }, position) => {
        const solution = solutionByProblem.get(problem.id);
        const isValid = validated.has(problem.id);
        const isMentioned = mentioned.has(problem.id);
        return (
          <details
            key={problem.id}
            open={interest > 0 || (!anyInterest && position === 0)}
            className="group rounded-xl border border-border bg-background/50 open:bg-card"
          >
            <summary className="flex min-h-14 items-start gap-3 p-4 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                {pi + 1}
              </span>
              {/* Mobile: badges debajo del texto; desde sm, columna angosta a la derecha */}
              <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <span className="min-w-0">
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Hipótesis</span>
                  <span className="block font-medium first-letter:uppercase">{problem.text}</span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5 sm:shrink-0 sm:flex-col sm:items-end">
                  {isValid ? (
                    <Badge tone="success">
                      <Check aria-hidden="true" /> Validado
                    </Badge>
                  ) : (
                    <Badge>Sin validar</Badge>
                  )}
                  {wanted.has(problem.id) ? <Badge tone="accent">Es prioridad</Badge> : null}
                  <label
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors duration-150",
                      "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      isMentioned
                        ? "border-accent/60 bg-accent/15 text-[hsl(272_70%_42%)] dark:text-[hsl(272_95%_78%)]"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isMentioned}
                      onChange={() => toggle("problemsMentioned", problem.id)}
                      className="sr-only"
                    />
                    {isMentioned ? <Check className="size-3.5" aria-hidden="true" /> : null}
                    Lo mencionó
                  </label>
                </span>
              </span>
            </summary>
            <div className="flex flex-col gap-7 border-t border-border p-4">
              {PER_PROBLEM_QUESTIONS.map((q, i) => {
                const key = answerKey(q.id, problem.id);
                return (
                  <QuestionField
                    key={key}
                    answerKey={key}
                    question={q}
                    answer={draft.answers[key]}
                    onChange={setAnswer}
                    index={i + 1}
                  />
                );
              })}
              <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={confirmed.has(problem.id)}
                  onChange={() => toggle("problemsConfirmed", problem.id)}
                  className="mt-0.5 size-5 accent-[hsl(var(--primary))]"
                />
                <span>
                  <span className="font-medium">Confirmado manualmente</span>
                  <span className="block text-muted-foreground">
                    Marcalo si lo mencionó por iniciativa propia con un caso concreto, aunque no hayas clasificado cada respuesta.
                  </span>
                </span>
              </label>
              {solution ? (
                <p className="rounded-lg bg-muted/60 p-3 text-sm">
                  <span className="font-medium">Si se valida → {solution.name}</span>
                  {solution.value ? <span className="text-muted-foreground"> · {solution.value}</span> : null}
                </p>
              ) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function CommitmentBlock({ draft, update }: { draft: Business; update: (patch: Partial<Business>) => void }) {
  return (
    <div className="flex flex-col gap-6 border-t border-border pt-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">Checklist de early evangelist</legend>
        <p className="mb-1 text-sm text-muted-foreground">Marcá solo lo que demostró con hechos durante la charla.</p>
        {EVANGELIST_CRITERIA.map((c, i) => (
          <label key={c} className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted/60">
            <input
              type="checkbox"
              checked={draft.evangelist[i]}
              onChange={(e) => update({ evangelist: draft.evangelist.with(i, e.target.checked) })}
              className="size-5 accent-[hsl(var(--primary))]"
            />
            {c}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">Compromiso obtenido</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {COMMITMENT_OPTIONS.map((o) => (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-sm transition-colors duration-150",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                draft.commitment === o.id ? "border-foreground/40 bg-muted" : "border-border hover:bg-muted/50",
              )}
            >
              <input
                type="radio"
                name="commitment"
                value={o.id}
                checked={draft.commitment === o.id}
                onChange={() => update({ commitment: o.id as Commitment })}
                className="sr-only"
              />
              <span className="font-medium">{o.label}</span>
              <span className="text-muted-foreground">{o.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Detalle del compromiso / próximo paso" htmlFor="b-commitment-note">
        <Textarea
          id="b-commitment-note"
          value={draft.commitmentNote}
          onChange={(e) => update({ commitmentNote: e.target.value })}
          placeholder="Ej: reunión el jueves 10 hs con el socio para ver una demo"
          rows={2}
        />
      </Field>
    </div>
  );
}

function ObjectionsStep({ draft, update }: { draft: Business; update: (patch: Partial<Business>) => void }) {
  const active = new Map(draft.objections.map((o) => [o.id, o.note]));

  const toggle = (id: string) => {
    update({
      objections: active.has(id) ? draft.objections.filter((o) => o.id !== id) : [...draft.objections, { id, note: "" }],
    });
  };
  const setNote = (id: string, note: string) => {
    update({ objections: draft.objections.map((o) => (o.id === id ? { ...o, note } : o)) });
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Marcá las objeciones que aparecieron. Cada una trae una <strong className="text-foreground">etiqueta</strong> para
        nombrar la emoción y una <strong className="text-foreground">pregunta calibrada</strong> para seguir sin confrontar.
      </p>
      <ul className="flex flex-col gap-3">
        {OBJECTIONS.map((o) => {
          const isOn = active.has(o.id);
          return (
            <li key={o.id} className={cn("rounded-xl border p-4 transition-colors duration-150", isOn ? "border-foreground/30 bg-muted/40" : "border-border")}>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={isOn} onChange={() => toggle(o.id)} className="mt-0.5 size-5 accent-[hsl(var(--primary))]" />
                <span className="flex-1">
                  <span className="block font-medium">“{o.phrase}”</span>
                  <span className="block text-sm text-muted-foreground">{o.meaning}</span>
                </span>
              </label>
              {isOn ? (
                <div className="mt-3 flex flex-col gap-3 pl-8">
                  <dl className="grid gap-2 text-sm">
                    {o.label !== "—" ? (
                      <div>
                        <dt className="font-medium">Etiqueta</dt>
                        <dd className="text-muted-foreground">“{o.label}” + silencio</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="font-medium">Pregunta calibrada</dt>
                      <dd className="text-muted-foreground">“{o.calibrated}”</dd>
                    </div>
                  </dl>
                  <label className="sr-only" htmlFor={`obj-${o.id}`}>
                    Qué respondió ante la objeción
                  </label>
                  <Textarea
                    id={`obj-${o.id}`}
                    value={active.get(o.id) ?? ""}
                    onChange={(e) => setNote(o.id, e.target.value)}
                    placeholder="¿Qué respondió después?"
                    rows={2}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Field label="Notas generales" htmlFor="b-notes" hint="Observaciones, contexto, cisnes negros, recordatorios.">
        <Textarea id="b-notes" value={draft.notes} onChange={(e) => update({ notes: e.target.value })} rows={4} />
      </Field>
      <p className="text-sm text-muted-foreground">¿Listo? Guardá para ver el veredicto y las soluciones recomendadas.</p>
    </div>
  );
}
