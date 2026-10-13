"use client";

import { useSyncExternalStore } from "react";
import { normalizeBusiness } from "./business";
import type { Business } from "./types";

/**
 * Store de negocios sobre localStorage, consumido con useSyncExternalStore.
 * - Clave versionada para poder migrar el formato en el futuro.
 * - Snapshot cacheado: solo se re-parsea cuando cambia el string guardado.
 * - Escucha el evento "storage" para sincronizar entre pestañas.
 */

const STORAGE_KEY = "pxn:businesses:v1";
const EMPTY: Business[] = [];

let cachedRaw: string | null = null;
let cachedList: Business[] = EMPTY;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): Business[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  if (!raw) {
    cachedList = EMPTY;
    return cachedList;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    cachedList = Array.isArray(parsed)
      ? parsed.map(normalizeBusiness).filter((b): b is Business => b !== null)
      : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

const getServerSnapshot = () => EMPTY;
/** En el servidor y durante la hidratación no hay datos: permite mostrar un estado de carga */
const getHydratedServer = () => false;
const getHydratedClient = () => true;
const noopSubscribe = () => () => {};

function emit() {
  for (const l of listeners) l();
}

function onStorage(e: StorageEvent) {
  if (e.key === STORAGE_KEY || e.key === null) emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function write(list: Business[]) {
  const raw = JSON.stringify(list);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch (err) {
    console.error("[storage] No se pudo guardar en localStorage", err);
    throw new Error("No se pudo guardar: el almacenamiento del navegador está lleno o bloqueado.");
  }
  cachedRaw = raw;
  cachedList = list;
  emit();
}

export function getBusinesses(): Business[] {
  return getSnapshot();
}

export function getBusiness(id: string): Business | undefined {
  return getSnapshot().find((b) => b.id === id);
}

export function saveBusiness(business: Business) {
  const list = getSnapshot();
  const idx = list.findIndex((b) => b.id === business.id);
  const next = idx === -1 ? [business, ...list] : list.with(idx, business);
  write(next);
}

export function deleteBusinesses(ids: string[]) {
  const remove = new Set(ids);
  write(getSnapshot().filter((b) => !remove.has(b.id)));
}

export function replaceAll(list: Business[]) {
  write(list);
}

export function useBusinesses(): Business[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** true una vez hidratado en el cliente (los datos de localStorage ya están disponibles) */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, getHydratedClient, getHydratedServer);
}
