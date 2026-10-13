"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  /** Ocultar el texto en pantallas chicas (queda accesible para lectores de pantalla) */
  compact?: boolean;
}

export function NavItemLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg px-2.5 text-sm sm:px-3 font-medium transition-colors duration-150 [&_svg]:size-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {item.icon}
      <span className={item.compact ? "sr-only md:not-sr-only" : undefined}>{item.label}</span>
    </Link>
  );
}

/** Lee la ruta actual para marcar el ítem activo (debe ir dentro de <Suspense>) */
export function ActiveNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return items.map((item) => (
    <NavItemLink
      key={item.href}
      item={item}
      active={item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)}
    />
  ));
}
