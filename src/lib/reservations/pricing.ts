import { SERVICE_FEE_BY_CATEGORY, type RestaurantCategory } from "@/lib/constants";

export function computeServiceFee(category: RestaurantCategory): number {
  return SERVICE_FEE_BY_CATEGORY[category];
}
