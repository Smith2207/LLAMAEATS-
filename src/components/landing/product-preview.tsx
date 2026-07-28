"use client";

import { motion } from "framer-motion";
import { Search, Star, QrCode, MapPin } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function ProductPreview() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      className="relative mx-auto w-full max-w-xs"
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-2xl shadow-titicaca-900/20"
      >
        {/* Barra superior */}
        <div className="flex items-center justify-between border-b border-border/60 bg-titicaca-900 px-4 py-3">
          <span className="font-display text-sm font-bold text-white">LlamaEats</span>
          <span className="text-[10px] font-medium text-white/70">19:04</span>
        </div>

        <div className="space-y-3 p-4">
          {/* Buscador */}
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            <Search className="size-3.5 shrink-0" />
            Restaurantes frente al lago
          </div>

          {/* Card de restaurante */}
          <div className="overflow-hidden rounded-xl border border-border/60">
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-titicaca-600 via-titicaca-500 to-terracota-400">
              <MapPin className="size-6 text-white/80" />
            </div>
            <div className="space-y-1.5 bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Q&#39;iñi Wasi</span>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-terracota-500">
                  <Star className="size-3 fill-terracota-400 text-terracota-400" />
                  4.8
                </span>
              </div>
              <span className="block text-[10px] text-muted-foreground">Mesa disponible · 19:00</span>
            </div>
          </div>

          {/* Confirmación con QR */}
          <div className="flex items-center gap-3 rounded-xl bg-titicaca-950 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <QrCode className="size-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-[11px] font-semibold text-white">Reserva confirmada</span>
              <span className="block text-[10px] text-white/60">Código LL-4821 · S/ 4 de tarifa</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Halo de fondo, acento de marca */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-lake-glow/25 via-transparent to-terracota-400/20 blur-2xl"
      />
    </motion.div>
  );
}
