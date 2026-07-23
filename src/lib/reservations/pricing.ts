import {
  LAUNCH_PROMO_DISCOUNT,
  LAUNCH_PROMO_END_DATE,
  SERVICE_FEE_BY_CATEGORY,
  type RestaurantCategory,
} from "@/lib/constants";

export function isLaunchPromoActive(at: Date = new Date()): boolean {
  return at.getTime() < new Date(`${LAUNCH_PROMO_END_DATE}T23:59:59-05:00`).getTime();
}

export function baseServiceFee(category: RestaurantCategory): number {
  return SERVICE_FEE_BY_CATEGORY[category];
}

/** Tarifa de servicio real a cobrar, con el descuento de lanzamiento aplicado
 * mientras la promo esté activa (nunca baja de S/1). */
export function computeServiceFee(category: RestaurantCategory, at: Date = new Date()): number {
  const base = baseServiceFee(category);
  if (!isLaunchPromoActive(at)) return base;
  return Math.max(base - LAUNCH_PROMO_DISCOUNT, 1);
}
