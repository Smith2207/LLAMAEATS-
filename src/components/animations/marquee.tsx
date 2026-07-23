"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
  durationSeconds = 28,
}: {
  items: string[];
  className?: string;
  durationSeconds?: number;
}) {
  const reducedMotion = useReducedMotion();
  const track = [...items, ...items];

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn("flex w-max gap-10", !reducedMotion && "animate-marquee")}
        style={!reducedMotion ? { animationDuration: `${durationSeconds}s` } : undefined}
      >
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="whitespace-nowrap font-display text-lg font-semibold text-muted-foreground/70"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
