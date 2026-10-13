import indexData from "@/data/niche-index.json";
import type { Category, NicheIndex, NicheSummary } from "./types";

/** Índice liviano (~24KB) apto para el cliente: nombres y categorías, sin problemas ni soluciones */
export const NICHE_INDEX = indexData as NicheIndex;

export const NICHE_BY_ID = new Map<string, NicheSummary>(NICHE_INDEX.niches.map((n) => [n.id, n]));
export const CATEGORY_BY_ID = new Map<string, Category>(NICHE_INDEX.categories.map((c) => [c.id, c]));

export function nicheName(id: string): string {
  return NICHE_BY_ID.get(id)?.name ?? "Nicho desconocido";
}

export function categoryOfNiche(id: string): Category | undefined {
  const n = NICHE_BY_ID.get(id);
  return n ? CATEGORY_BY_ID.get(n.categoryId) : undefined;
}

/** Nichos agrupados por categoría, en el orden del documento fuente */
export const NICHES_BY_CATEGORY: { category: Category; niches: NicheSummary[] }[] =
  NICHE_INDEX.categories.map((category) => ({
    category,
    niches: NICHE_INDEX.niches.filter((n) => n.categoryId === category.id),
  }));

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
