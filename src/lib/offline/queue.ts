"use client";

// Cola de acciones offline para el panel de reservas del restaurante.
//
// Deliberadamente NO incluye creación de reservas ni reprogramación por
// arrastre: esas operaciones necesitan disponibilidad en vivo para no
// generar dobles reservas al reconectar. Solo se admiten acciones que
// operan sobre una reserva YA asignada (llegó / no asistió / liberar mesa),
// donde el peor caso de conflicto es "la reserva ya cambió de estado en el
// servidor", algo que el propio servidor detecta y reporta, no algo que
// pueda chocar con otra reserva.

const DB_NAME = "llamaeats-offline";
const DB_VERSION = 1;
const STORE_NAME = "action-queue";

export type OfflineActionType = "markArrival" | "markNoShow" | "releaseTable";

export type OfflineAction = {
  id: string;
  type: OfflineActionType;
  code: string;
  label: string;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueOfflineAction(
  action: Omit<OfflineAction, "id" | "createdAt">,
): Promise<OfflineAction> {
  const db = await openDb();
  const full: OfflineAction = { ...action, id: crypto.randomUUID(), createdAt: Date.now() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(full);
    tx.oncomplete = () => resolve(full);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedActions(): Promise<OfflineAction[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as OfflineAction[]);
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueuedAction(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
