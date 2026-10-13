"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NICHE_BY_ID } from "@/lib/niches";
import { getBusiness, useBusinesses, useHydrated } from "@/lib/storage";
import { BusinessForm } from "./business-form";
import { BusinessDetail } from "./business-detail";

export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function NotFoundBusiness() {
  return (
    <EmptyState
      icon={<SearchX />}
      title="No encontramos ese negocio"
      description="Puede que se haya eliminado o que esté guardado en otro navegador. Importá tu JSON para recuperarlo."
      action={
        <Link href="/negocios" className={buttonClasses("primary")}>
          Ir a negocios
        </Link>
      }
    />
  );
}

export function NewBusinessLoader() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const nicho = params.get("nicho");
  if (!hydrated) return <FormSkeleton />;
  return <BusinessForm defaultNicheId={nicho && NICHE_BY_ID.has(nicho) ? nicho : undefined} />;
}

export function EditBusinessLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hydrated = useHydrated();
  useBusinesses(); // re-render si llega por otra pestaña / import
  if (!hydrated) return <FormSkeleton />;
  const business = getBusiness(id);
  if (!business) return <NotFoundBusiness />;
  // key: si cambia el negocio (p. ej. import), reinicia el formulario
  return <BusinessForm key={business.id} initial={business} />;
}

export function DetailBusinessLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hydrated = useHydrated();
  const businesses = useBusinesses();
  if (!hydrated) return <FormSkeleton />;
  const business = businesses.find((b) => b.id === id);
  if (!business) return <NotFoundBusiness />;
  return <BusinessDetail business={business} />;
}
