import type { Metadata } from "next";
import { Suspense } from "react";
import { BusinessList } from "@/components/business/business-list";
import { ListSkeleton } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Negocios" };

export default function BusinessesPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <BusinessList />
    </Suspense>
  );
}
