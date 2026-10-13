// Solo para Server Components: incluye todos los problemas y soluciones (~780KB).
// No importar desde componentes "use client".
import data from "@/data/niches.json";
import type { Category, Niche } from "./types";

const all = data as { categories: Category[]; niches: Niche[] };

export const ALL_NICHES = all.niches;
export const ALL_CATEGORIES = all.categories;
const byId = new Map(all.niches.map((n) => [n.id, n]));

export function getNiche(id: string): Niche | undefined {
  return byId.get(id);
}
