"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark" | "system";
const KEY = "pxn:theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const c = document.documentElement.classList;
  c.toggle("dark", dark);
  c.toggle("light", !dark);
}

function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  apply(theme);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const OPTIONS: { id: Theme; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Tema claro", Icon: Sun },
  { id: "system", label: "Tema del sistema", Icon: Monitor },
  { id: "dark", label: "Tema oscuro", Icon: Moon },
];

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);

  // Si sigue al sistema, reaccionar cuando el sistema cambia
  useEffect(() => {
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const idx = OPTIONS.findIndex((o) => o.id === theme);
  const next = OPTIONS[(idx + 1) % OPTIONS.length];
  const CurrentIcon = OPTIONS[idx].Icon;

  return (
    <>
    {/* Móvil: un solo botón que rota claro → sistema → oscuro */}
    <button
      type="button"
      onClick={() => setTheme(next.id)}
      aria-label={`${OPTIONS[idx].label}. Cambiar a ${next.label.toLowerCase()}`}
      className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
    >
      <CurrentIcon className="size-4" aria-hidden="true" />
    </button>
    <div role="radiogroup" aria-label="Tema" className="flex items-center rounded-lg border border-border bg-card p-0.5 max-sm:hidden">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={theme === id}
          aria-label={label}
          title={label}
          onClick={() => setTheme(id)}
          className={cn(
            "grid size-9 place-items-center rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            theme === id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      ))}
    </div>
    </>
  );
}
