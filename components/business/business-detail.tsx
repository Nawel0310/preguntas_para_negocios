"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { OBJECTIONS_BY_ID } from "@/data/objections";
import {
  answerKey,
  COMMITMENT_OPTIONS,
  EVANGELIST_CRITERIA,
  PER_PROBLEM_QUESTIONS,
  PHASES,
  QUESTIONS_BY_PHASE,
  SIGNAL_OPTIONS,
  type Question,
} from "@/data/questions";
import { formatDateTime, formatUsd } from "@/lib/format";
import { categoryOfNiche, nicheName } from "@/lib/niches";
import { businessEditHref } from "@/lib/routes";
import { scoreBusiness, VERDICT_META } from "@/lib/scoring";
import { deleteBusinesses } from "@/lib/storage";
import { downloadJson } from "@/lib/transfer";
import type { Answer, Business, Niche } from "@/lib/types";
import { WithNiche } from "./niche-boundary";
import { ScoreMeter, VerdictBadge } from "./verdict";

const SIGNAL_LABEL = new Map(SIGNAL_OPTIONS.map((o) => [o.id, o.label]));
const SIGNAL_TONE = { fact: "success", vague: "warning", compliment: "danger" } as const;

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function BusinessDetail({ business }: { business: Business }) {
  const router = useRouter();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const score = useMemo(() => scoreBusiness(business), [business]);
  const commitment = COMMITMENT_OPTIONS.find((c) => c.id === business.commitment);

  const remove = () => {
    deleteBusinesses([business.id]);
    toast(`"${business.name}" eliminado.`);
    router.push("/negocios");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link href="/negocios" className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Negocios
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-2xl font-bold break-words sm:text-3xl">{business.name}</h1>
            <p className="text-muted-foreground">
              {nicheName(business.nicheId)}
              {categoryOfNiche(business.nicheId) ? ` · ${categoryOfNiche(business.nicheId)?.name}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {[business.contactName, business.contactChannel, business.interviewMode].filter(Boolean).join(" · ")}
              {" · "}Actualizado {formatDateTime(business.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={businessEditHref(business.id)} className={buttonClasses("primary")}>
              <Pencil aria-hidden="true" /> Editar respuestas
            </Link>
            <Button variant="outline" onClick={() => downloadJson([business], `negocio-${slug(business.name)}.json`)}>
              <Download aria-hidden="true" /> Exportar
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(true)} className="text-red-700 dark:text-red-400">
              <Trash2 aria-hidden="true" /> Eliminar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Veredicto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <VerdictBadge verdict={score.verdict} className="self-start px-3 py-1 text-sm" />
            <ScoreMeter score={score.score} />
            <p className="text-sm text-muted-foreground">{VERDICT_META[score.verdict].description}</p>
            {score.zombie ? (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm">
                <strong>Posible cliente zombi:</strong> dijo cosas lindas pero no se comprometió. Pedí un próximo paso concreto o
                descartalo.
              </p>
            ) : null}
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Stat label="Hechos" value={score.facts} />
              <Stat label="Vagas" value={score.vague} />
              <Stat label="Cumplidos" value={score.compliments} />
              <Stat label="Problemas validados" value={score.validatedProblemIds.length} />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compromiso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>
              <Badge tone={business.commitment === "none" ? "danger" : "success"}>{commitment?.label}</Badge>
            </p>
            {business.commitmentNote ? <p>{business.commitmentNote}</p> : <p className="text-muted-foreground">{commitment?.description}</p>}
            <div>
              <p className="mb-1.5 font-medium">
                Early evangelist <span className="tabular-nums text-muted-foreground">({score.evangelistCount}/5)</span>
              </p>
              <ul className="flex flex-col gap-1">
                {EVANGELIST_CRITERIA.map((c, i) => (
                  <li key={c} className={business.evangelist[i] ? "" : "text-muted-foreground line-through decoration-muted-foreground/50"}>
                    {business.evangelist[i] ? "✓ " : "· "}
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {business.nicheId ? (
        <WithNiche id={business.nicheId}>
          {(niche) => <NicheSections niche={niche} business={business} validated={score.validatedProblemIds} />}
        </WithNiche>
      ) : null}

      {PHASES.filter((p) => p.id !== "problemas").map((phase) => (
        <AnswerGroup key={phase.id} title={phase.title} questions={QUESTIONS_BY_PHASE[phase.id]} answers={business.answers} />
      ))}

      {business.objections.length > 0 || business.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Objeciones y notas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {business.objections.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {business.objections.map((o) => {
                  const meta = OBJECTIONS_BY_ID.get(o.id);
                  return (
                    <li key={o.id} className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium">“{meta?.phrase ?? o.id}”</p>
                      {o.note ? <p className="mt-1 whitespace-pre-wrap">{o.note}</p> : null}
                      {meta ? <p className="mt-1 text-muted-foreground">Pregunta calibrada: “{meta.calibrated}”</p> : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {business.notes ? <p className="whitespace-pre-wrap text-sm">{business.notes}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="¿Eliminar este negocio?"
        description={`Se borrará "${business.name}" y todas sus respuestas de este navegador. No se puede deshacer, salvo que tengas un JSON exportado.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={remove}>
              <Trash2 aria-hidden="true" /> Eliminar
            </Button>
          </>
        }
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function AnswerItem({ question, answer }: { question: Question; answer?: Answer }) {
  const has = answer && (answer.text.trim() || answer.signal);
  return (
    <div className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium">{question.text}</p>
        {answer?.signal ? <Badge tone={SIGNAL_TONE[answer.signal]}>{SIGNAL_LABEL.get(answer.signal)}</Badge> : null}
      </div>
      {has && answer.text.trim() ? (
        <p className="whitespace-pre-wrap text-sm">{answer.text}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">Sin respuesta</p>
      )}
    </div>
  );
}

function AnswerGroup({ title, questions, answers }: { title: string; questions: Question[]; answers: Record<string, Answer> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {questions.map((q) => (
          <AnswerItem key={q.id} question={q} answer={answers[q.id]} />
        ))}
      </CardContent>
    </Card>
  );
}

function NicheSections({ niche, business, validated }: { niche: Niche; business: Business; validated: string[] }) {
  const validSet = new Set(validated);
  const recommended = niche.solutions.filter((s) => s.problemId && validSet.has(s.problemId));
  const total = recommended.reduce(
    (acc, s) => ({ min: acc.min + s.priceMin, max: acc.max + s.priceMax }),
    { min: 0, max: 0 },
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Soluciones recomendadas</CardTitle>
          <p className="text-sm text-muted-foreground">Solo las que resuelven problemas validados con hechos.</p>
        </CardHeader>
        <CardContent>
          {recommended.length === 0 ? (
            <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
              Ningún problema quedó validado. No ofrezcas nada todavía: volvé a preguntar por hechos concretos o descartá el
              prospecto.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <ul className="grid gap-3 md:grid-cols-2">
                {recommended.map((s) => (
                  <li key={s.id} className="flex flex-col gap-2 rounded-xl border border-primary/50 bg-primary/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold">{s.name}</h3>
                      <Badge tone="primary" className="tabular-nums">
                        {formatUsd(s.priceMin, s.priceMax)}
                      </Badge>
                    </div>
                    <p className="text-sm">{s.description}</p>
                    <details className="text-sm">
                      <summary className="text-muted-foreground hover:text-foreground">Qué incluye</summary>
                      <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                        {s.deliverables.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
              {recommended.length > 1 ? (
                <p className="text-sm text-muted-foreground">
                  Rango combinado: <strong className="tabular-nums text-foreground">{formatUsd(total.min, total.max)}</strong>
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problemas del nicho</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {niche.problems.map((p, i) => (
            <details key={p.id} className="group rounded-xl border border-border" open={validSet.has(p.id)}>
              <summary className="flex min-h-12 items-start gap-3 p-4 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium first-letter:uppercase">{p.text}</span>
                {validSet.has(p.id) ? <Badge tone="success">Validado</Badge> : <Badge>Sin validar</Badge>}
              </summary>
              <div className="divide-y divide-border border-t border-border p-4">
                {PER_PROBLEM_QUESTIONS.map((q) => (
                  <AnswerItem key={q.id} question={q} answer={business.answers[answerKey(q.id, p.id)]} />
                ))}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
