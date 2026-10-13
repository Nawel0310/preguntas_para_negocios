import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "secondary" | "accent" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/20 text-foreground dark:text-primary",
  secondary: "bg-secondary/20 text-[hsl(246_60%_40%)] dark:text-secondary",
  accent: "bg-accent/15 text-[hsl(272_70%_42%)] dark:text-[hsl(272_95%_78%)]",
  success: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  danger: "bg-red-500/15 text-red-800 dark:text-red-300",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
