import type { Metadata } from "next";
import { Suspense } from "react";
import { EditBusinessLoader, FormSkeleton } from "@/components/business/form-loaders";

export const metadata: Metadata = { title: "Editar prospecto" };

export default function EditBusinessPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditBusinessLoader />
    </Suspense>
  );
}
