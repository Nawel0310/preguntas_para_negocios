import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Building2, LayoutDashboard, Plus } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ActiveNav, NavItemLink, type NavItem } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: <LayoutDashboard aria-hidden="true" />, exact: true, compact: true },
  { href: "/negocios", label: "Negocios", icon: <Building2 aria-hidden="true" /> },
  { href: "/nichos", label: "Nichos", icon: <BookOpen aria-hidden="true" /> },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.1 9a3 3 0 1 1 4.2 2.7c-.8.4-1.3 1.2-1.3 2.1V15" />
              <path d="M12 19h.01" />
            </svg>
          </span>
          <span className="hidden sm:inline">Prospectar</span>
        </Link>
        <nav aria-label="Principal" className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          <Suspense fallback={NAV_ITEMS.map((item) => <NavItemLink key={item.href} item={item} active={false} />)}>
            <ActiveNav items={NAV_ITEMS} />
          </Suspense>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/negocios/nuevo" className={buttonClasses("primary", "sm", "max-sm:hidden")}>
            <Plus aria-hidden="true" />
            Nuevo prospecto
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
