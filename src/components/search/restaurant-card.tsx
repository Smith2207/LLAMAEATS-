"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "@/lib/constants";
import { computeServiceFee } from "@/lib/reservations/pricing";

export type RestaurantCardData = {
  id: string;
  slug: string;
  name: string;
  district: string;
  category: string;
  coverBlobUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  const categoryLabel =
    RESTAURANT_CATEGORIES.find((c) => c.value === restaurant.category)?.label ??
    restaurant.category;
  const fee = computeServiceFee(restaurant.category as RestaurantCategory);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={`/restaurantes/${restaurant.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors hover:border-primary/40"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
          {restaurant.coverBlobUrl ? (
            <Image
              src={restaurant.coverBlobUrl}
              alt={restaurant.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UtensilsCrossed className="size-10 text-muted-foreground/40" />
            </div>
          )}
          <Badge className="absolute left-3 top-3 bg-titicaca-900/80 text-sand-100 backdrop-blur">
            {categoryLabel}
          </Badge>
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          <h3 className="font-display font-semibold text-foreground">{restaurant.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {restaurant.district}
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-foreground">
              <Star className="size-3.5 fill-primary text-primary" />
              {restaurant.avgRating ? restaurant.avgRating.toFixed(1) : "Nuevo"}
              {restaurant.reviewCount > 0 && (
                <span className="text-muted-foreground">({restaurant.reviewCount})</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">Tarifa S/ {fee.toFixed(2)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
