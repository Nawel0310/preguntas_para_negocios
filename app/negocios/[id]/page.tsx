import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBusinessLoader, FormSkeleton } from "@/components/business/form-loaders";

export const metadata: Metadata = { title: "Prospecto" };

export default function BusinessPage({ params }: PageProps<"/negocios/[id]">) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <DetailBusinessLoader params={params} />
    </Suspense>
  );
}
