"use client";

import { useCallback, useEffect, useState } from "react";
import {
  markArrivalAction,
  markNoShowAction,
  releaseTableAction,
} from "@/actions/attendance/mark-attendance";
import {
  enqueueOfflineAction,
  getQueuedActions,
  removeQueuedAction,
  type OfflineAction,
  type OfflineActionType,
} from "@/lib/offline/queue";

const ACTION_BY_TYPE: Record<
  OfflineActionType,
  (input: { code: string }) => Promise<{ data?: unknown; serverError?: string }>
> = {
  markArrival: markArrivalAction,
  markNoShow: markNoShowAction,
  releaseTable: releaseTableAction,
};

export type OfflineConflict = { action: OfflineAction; error: string };

export function useOfflineSync(onReplaySuccess: () => void) {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<OfflineAction[]>([]);
  const [conflicts, setConflicts] = useState<OfflineConflict[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshQueue = useCallback(() => {
    getQueuedActions().then(setQueue).catch(() => {});
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    refreshQueue();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/restaurante/" }).catch(() => {});
    }
  }, [refreshQueue]);

  const replayQueue = useCallback(async () => {
    const pending = await getQueuedActions();
    if (pending.length === 0) return;

    setIsSyncing(true);
    const newConflicts: OfflineConflict[] = [];

    for (const action of pending) {
      try {
        const result = await ACTION_BY_TYPE[action.type]({ code: action.code });
        if (result?.serverError) {
          newConflicts.push({ action, error: result.serverError });
        }
      } catch {
        newConflicts.push({ action, error: "No se pudo sincronizar. Revisa esta reserva manualmente." });
      }
      await removeQueuedAction(action.id);
    }

    setIsSyncing(false);
    setConflicts((prev) => [...prev, ...newConflicts]);
    refreshQueue();
    onReplaySuccess();
  }, [onReplaySuccess, refreshQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      replayQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [replayQueue]);

  const queueAction = useCallback(
    async (type: OfflineActionType, code: string, label: string) => {
      await enqueueOfflineAction({ type, code, label });
      refreshQueue();
    },
    [refreshQueue],
  );

  const dismissConflict = useCallback((actionId: string) => {
    setConflicts((prev) => prev.filter((c) => c.action.id !== actionId));
  }, []);

  return { isOnline, queue, conflicts, isSyncing, queueAction, dismissConflict };
}
