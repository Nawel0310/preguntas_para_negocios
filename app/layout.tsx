import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import { ThemeScript } from "@/components/layout/theme-script";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Prospectar · Preguntas para negocios",
    template: "%s · Prospectar",
  },
  description:
    "Validá si cada negocio necesita tu solución con preguntas basadas en The Mom Test y Rompe la barrera del no.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5fffb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f13" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={monaSans.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        <ToastProvider>
          <Header />
          <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
            {children}
          </main>
        </ToastProvider>
        <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          Datos guardados en este navegador · Exportá un JSON para no perderlos
        </footer>
      </body>
    </html>
  );
}
