"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Waves, PartyPopper, CookingPot, ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    value: "vista_al_lago",
    label: "Vista al lago",
    description: "Mesas frente al Titicaca, ideales para el atardecer.",
    icon: Waves,
    gradient: "from-titicaca-600 via-titicaca-500 to-lake-glow",
  },
  {
    value: "peña_con_show",
    label: "Peña con show",
    description: "Música y danzas en vivo mientras cenas.",
    icon: PartyPopper,
    gradient: "from-terracota-600 via-terracota-500 to-terracota-400",
  },
  {
    value: "comida_tipica",
    label: "Comida típica",
    description: "Sabores puneños de siempre, hechos en casa.",
    icon: CookingPot,
    gradient: "from-sand-200 via-titicaca-600 to-titicaca-900",
  },
] as const;

export function FeaturedCategories() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        Elige tu plan para hoy
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.value}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.06, ease: "easeOut" }}
          >
            <Link
              href={`/buscar?category=${encodeURIComponent(cat.value)}`}
              className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-lg hover:shadow-titicaca-900/10"
            >
              <div
                className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${cat.gradient}`}
              >
                <cat.icon className="size-9 text-white/90 transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-foreground">{cat.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                <span className="mt-3 flex items-center gap-1 text-sm font-medium text-terracota-400">
                  Ver restaurantes
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
