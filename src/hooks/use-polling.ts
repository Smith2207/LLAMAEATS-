"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Refresca los datos del servidor cada `intervalMs` (bandeja de reservas del día). */
export function usePolling(intervalMs = 20000) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(interval);
  }, [router, intervalMs]);
}
