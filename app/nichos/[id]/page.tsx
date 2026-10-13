import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { ContactStrategy } from "@/components/niches/contact-strategy";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/format";
import { CATEGORY_BY_ID } from "@/lib/niches";
import { ALL_NICHES, getNiche } from "@/lib/niches-server";

export function generateStaticParams() {
  return ALL_NICHES.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: PageProps<"/nichos/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getNiche(id)?.name ?? "Nicho" };
}

export default async function NichePage({ params }: PageProps<"/nichos/[id]">) {
  const { id } = await params;
  const niche = getNiche(id);
  if (!niche) notFound();
  const solutionByProblem = new Map(niche.solutions.map((s) => [s.problemId, s]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link href="/nichos" className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Nichos
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{CATEGORY_BY_ID.get(niche.categoryId)?.name}</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{niche.name}</h1>
          </div>
          <Link href={`/negocios/nuevo?nicho=${niche.id}`} className={buttonClasses("primary")}>
            <Plus aria-hidden="true" /> Prospectar un negocio de este nicho
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="problemas" className="flex flex-col gap-4">
          <h2 id="problemas" className="text-lg font-semibold">
            Problemas y soluciones
          </h2>
          {niche.problems.map((p, i) => {
            const s = solutionByProblem.get(p.id);
            return (
              <Card key={p.id}>
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Problema {i + 1}</p>
                  <p className="font-medium first-letter:uppercase">{p.text}</p>
                </CardHeader>
                {s ? (
                  <CardContent className="flex flex-col gap-2 border-t border-border pt-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold">{s.name}</h3>
                      <Badge tone="primary" className="tabular-nums">
                        {formatUsd(s.priceMin, s.priceMax)}
                      </Badge>
                    </div>
                    <p className="text-sm">{s.description}</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {s.deliverables.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </CardContent>
                ) : null}
              </Card>
            );
          })}
        </section>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estrategia de contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactStrategy contacts={niche.contacts} tip={niche.contactTip} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
