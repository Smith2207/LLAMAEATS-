"use client";

import { useEffect, useState } from "react";

export function useCountdown(targetIso: string | null) {
  const [msLeft, setMsLeft] = useState(() =>
    targetIso ? new Date(targetIso).getTime() - Date.now() : 0,
  );

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const tick = () => setMsLeft(Math.max(0, target - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    label: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    isExpired: targetIso ? msLeft <= 0 : false,
    totalSeconds,
  };
}
