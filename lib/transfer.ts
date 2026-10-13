import { nameKey, newId, normalizeBusiness } from "./business";
import type { Business, ExportFile } from "./types";

export function buildExport(businesses: Business[]): ExportFile {
  return {
    app: "preguntas-para-negocios",
    version: 1,
    exportedAt: new Date().toISOString(),
    businesses,
  };
}

export function downloadJson(businesses: Business[], filename?: string) {
  const data = buildExport(businesses);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `negocios-${data.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export interface ParsedImport {
  businesses: Business[];
  invalid: number;
}

/** Acepta el formato de exportación o un array suelto de negocios */
export function parseImport(text: string): ParsedImport {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es un JSON válido.");
  }
  let raw: unknown[];
  let fileDate: string | undefined;
  if (Array.isArray(data)) raw = data;
  else if (data && typeof data === "object" && Array.isArray((data as ExportFile).businesses)) {
    raw = (data as ExportFile).businesses;
    fileDate = (data as ExportFile).exportedAt;
  } else {
    throw new Error("El JSON no tiene una lista de negocios (\"businesses\").");
  }

  const businesses: Business[] = [];
  let invalid = 0;
  for (const item of raw) {
    // Si un registro no trae updatedAt, usamos la fecha de exportación del archivo
    const withDate =
      fileDate && item && typeof item === "object" && !(item as Business).updatedAt
        ? { ...item, updatedAt: fileDate }
        : item;
    const b = normalizeBusiness(withDate);
    if (b) businesses.push(b);
    else invalid++;
  }
  return { businesses, invalid };
}

export interface MergeResult {
  merged: Business[];
  added: number;
  replaced: number;
  skipped: number;
}

/**
 * Une los negocios locales con los importados.
 * - Nombres nuevos se agregan (2 locales + 7 nuevos = 9).
 * - Si el nombre se repite (sin importar mayúsculas/acentos) gana el de `updatedAt` más reciente.
 */
export function mergeBusinesses(local: Business[], incoming: Business[]): MergeResult {
  const merged = [...local];
  const indexByName = new Map<string, number>();
  merged.forEach((b, i) => {
    const key = nameKey(b.name);
    if (!indexByName.has(key)) indexByName.set(key, i);
  });
  const ids = new Set(merged.map((b) => b.id));

  let added = 0;
  let replaced = 0;
  let skipped = 0;

  for (const inc of incoming) {
    const key = nameKey(inc.name);
    const idx = indexByName.get(key);
    if (idx === undefined) {
      // Evitar choques de id con otro negocio de distinto nombre
      const safe = ids.has(inc.id) ? { ...inc, id: newId() } : inc;
      indexByName.set(key, merged.push(safe) - 1);
      ids.add(safe.id);
      added++;
    } else if (Date.parse(inc.updatedAt) > Date.parse(merged[idx].updatedAt)) {
      // Conserva el id local para no romper enlaces abiertos
      merged[idx] = { ...inc, id: merged[idx].id };
      replaced++;
    } else {
      skipped++;
    }
  }

  merged.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return { merged, added, replaced, skipped };
}
