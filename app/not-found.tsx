import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      icon={<SearchX />}
      title="Página no encontrada"
      description="El enlace no existe o fue movido."
      action={
        <Link href="/" className={buttonClasses("primary")}>
          Ir al inicio
        </Link>
      }
    />
  );
}
