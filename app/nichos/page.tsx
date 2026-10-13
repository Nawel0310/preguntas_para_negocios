import type { Metadata } from "next";
import { NicheCatalog } from "@/components/niches/niche-catalog";

export const metadata: Metadata = { title: "Nichos" };

export default function NichesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Nichos</h1>
        <p className="max-w-2xl text-muted-foreground">
          Problemas típicos, soluciones y estrategia de contacto de cada nicho. Son hipótesis: validalas con cada negocio antes de
          ofrecer nada.
        </p>
      </div>
      <NicheCatalog />
    </div>
  );
}
