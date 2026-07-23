"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "@/lib/constants";
import { baseServiceFee, computeServiceFee, isLaunchPromoActive } from "@/lib/reservations/pricing";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function InfoHeader({
  name,
  description,
  address,
  district,
  category,
  openTime,
  closeTime,
  avgRating,
  reviewCount,
}: {
  name: string;
  description: string | null;
  address: string | null;
  district: string;
  category: string;
  openTime: string;
  closeTime: string;
  avgRating: number | null;
  reviewCount: number;
}) {
  const categoryLabel =
    RESTAURANT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
  const originalFee = baseServiceFee(category as RestaurantCategory);
  const fee = computeServiceFee(category as RestaurantCategory);
  const promoActive = isLaunchPromoActive();

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.08 }}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.3, ease: "easeOut" }} className="flex flex-wrap items-center gap-2">
        <Badge>{categoryLabel}</Badge>
        <span className="flex items-center gap-1 text-sm text-foreground">
          <Star className="size-4 fill-primary text-primary" />
          {avgRating ? avgRating.toFixed(1) : "Nuevo"}
          {reviewCount > 0 && <span className="text-muted-foreground">({reviewCount} reseñas)</span>}
        </span>
      </motion.div>
      <motion.h1
        variants={fadeUp}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl"
      >
        {name}
      </motion.h1>
      {description && (
        <motion.p variants={fadeUp} transition={{ duration: 0.3, ease: "easeOut" }} className="mt-3 text-muted-foreground">
          {description}
        </motion.p>
      )}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4" />
          {address ? `${address}, ${district}` : district}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          {openTime.slice(0, 5)} – {closeTime.slice(0, 5)}
        </span>
      </motion.div>
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
      >
        <span>
          Tarifa de servicio LlamaEats:{" "}
          {promoActive && (
            <span className="line-through opacity-60">S/ {originalFee.toFixed(2)}</span>
          )}{" "}
          <span className={promoActive ? "font-semibold text-primary" : undefined}>
            S/ {fee.toFixed(2)}
          </span>{" "}
          por reserva confirmada.
        </span>
        {promoActive && (
          <Badge className="gap-1 bg-primary/15 text-primary">
            <Sparkles className="size-3" />
            Promo de lanzamiento
          </Badge>
        )}
      </motion.p>
    </motion.div>
  );
}
