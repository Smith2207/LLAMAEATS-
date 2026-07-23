"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Gallery({
  cover,
  images,
  name,
}: {
  cover: string | null;
  images: string[];
  name: string;
}) {
  const all = [cover, ...images].filter((u): u is string => Boolean(u));
  const [active, setActive] = useState(0);

  if (all.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-secondary">
        <UtensilsCrossed className="size-12 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary">
        <AnimatePresence mode="wait">
          <motion.div
            key={all[active]}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={all[active]}
              alt={name}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {all.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {all.map((url, i) => (
            <button
              key={url + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                active === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
