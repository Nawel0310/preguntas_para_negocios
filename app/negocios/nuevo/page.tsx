import type { Metadata } from "next";
import { Suspense } from "react";
import { FormSkeleton, NewBusinessLoader } from "@/components/business/form-loaders";

export const metadata: Metadata = { title: "Nuevo prospecto" };

export default function NewBusinessPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewBusinessLoader />
    </Suspense>
  );
}
