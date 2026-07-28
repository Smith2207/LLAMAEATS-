"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Star, QrCode, MapPin, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export type FeaturedRestaurant = {
  slug: string;
  name: string;
  district: string;
  avgRating: number | null;
};

export function ProductPreview({ featured }: { featured: FeaturedRestaurant | null }) {
  const reducedMotion = useReducedMotion();
  const restaurantHref = featured ? `/restaurantes/${featured.slug}` : "/buscar?category=vista_al_lago";

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
          {/* Buscador — lleva a /buscar filtrado por vista al lago */}
          <Link
            href="/buscar?category=vista_al_lago"
            className="group flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-terracota-400/50 hover:text-foreground"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1">Restaurantes frente al lago</span>
            <ArrowRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          {/* Card de restaurante real — lleva a su ficha */}
          <Link
            href={restaurantHref}
            className="group block overflow-hidden rounded-xl border border-border/60 transition-colors hover:border-terracota-400/50"
          >
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-titicaca-600 via-titicaca-500 to-terracota-400">
              <MapPin className="size-6 text-white/80 transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="space-y-1.5 bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-foreground">
                  {featured ? featured.name : "Explora restaurantes"}
                </span>
                {featured && (
                  <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-terracota-500">
                    <Star className="size-3 fill-terracota-400 text-terracota-400" />
                    {featured.avgRating ? featured.avgRating.toFixed(1) : "Nuevo"}
                  </span>
                )}
              </div>
              <span className="block text-[10px] text-muted-foreground">
                {featured ? featured.district : "Ver disponibilidad ahora"}
              </span>
            </div>
          </Link>

          {/* Confirmación con QR — ilustra el paso final del flujo */}
          <div className="flex items-center gap-3 rounded-xl bg-titicaca-950 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <QrCode className="size-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-[11px] font-semibold text-white">Reserva confirmada</span>
              <span className="block text-[10px] text-white/60">Código QR al instante · desde S/ 3</span>
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
