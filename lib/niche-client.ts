"use client";

import type { Niche } from "./types";

/**
 * Carga bajo demanda del detalle de un nicho (public/data/niches/{id}.json).
 * Las promesas se cachean por módulo: son estables entre renders y se pueden pasar a `use()`.
 */
const cache = new Map<string, Promise<Niche>>();

export function loadNiche(id: string): Promise<Niche> {
  let promise = cache.get(id);
  if (!promise) {
    promise = fetch(`/data/niches/${encodeURIComponent(id)}.json`).then((res) => {
      if (!res.ok) throw new Error(`No se encontró el nicho "${id}"`);
      return res.json() as Promise<Niche>;
    });
    promise.catch(() => cache.delete(id));
    cache.set(id, promise);
  }
  return promise;
}

export function preloadNiche(id: string) {
  if (id) void loadNiche(id).catch(() => {});
}
