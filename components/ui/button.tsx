import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/85 active:bg-primary/75",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/85 active:bg-secondary/75",
  outline: "border border-border bg-card hover:bg-muted active:bg-muted/70",
  ghost: "hover:bg-muted active:bg-muted/70",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "size-11",
};

/** Clases de botón reutilizables también en <Link> */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap select-none",
    "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
