import { cache } from "react";
import { and, avg, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { restaurants, reviews } from "@/db/schema";
import type { restaurantStatusEnum } from "@/db/schema/enums";
import type { RestaurantCategory } from "@/lib/constants";

type RestaurantStatus = (typeof restaurantStatusEnum.enumValues)[number];
import { hasAvailableTable } from "@/lib/reservations/availability";

// Un restaurante recibe reservas en "aprobada" (dentro del período de
// prueba) y en "activa" (ya graduado) — ambos son públicos y reservables.
const BOOKABLE_STATUSES = ["aprobada", "activa"] as const;

export type SearchFilters = {
  category?: RestaurantCategory;
  district?: string;
  date?: string;
  timeSlot?: string;
  guests?: number;
};

export async function searchRestaurants(filters: SearchFilters) {
  const conditions = [inArray(restaurants.status, BOOKABLE_STATUSES)];
  if (filters.category) conditions.push(eq(restaurants.category, filters.category));
  if (filters.district) conditions.push(eq(restaurants.district, filters.district));

  const rows = await db.query.restaurants.findMany({
    where: and(...conditions),
    orderBy: [desc(restaurants.createdAt)],
  });

  const withRatings = await attachRatings(rows);

  if (filters.date && filters.timeSlot && filters.guests) {
    const flags = await Promise.all(
      withRatings.map((r) =>
        hasAvailableTable({
          restaurantId: r.id,
          date: filters.date!,
          timeSlot: filters.timeSlot!,
          guests: filters.guests!,
          turnoverBufferMinutes: r.turnoverBufferMinutes,
        }),
      ),
    );
    return withRatings.filter((_, i) => flags[i]);
  }

  return withRatings;
}

// cache(): generateMetadata() y la página llaman esta función con el mismo
// slug en el mismo request — sin memoizar, sería una consulta duplicada.
export const getRestaurantBySlug = cache(async (slug: string) => {
  const restaurant = await db.query.restaurants.findFirst({
    where: and(eq(restaurants.slug, slug), inArray(restaurants.status, BOOKABLE_STATUSES)),
    with: {
      tables: { where: (t, { eq }) => eq(t.isActive, true) },
    },
  });
  if (!restaurant) return null;

  const [rating] = await attachRatings([restaurant]);
  return rating;
});

export async function getRestaurantReviews(restaurantId: string) {
  return db.query.reviews.findMany({
    where: eq(reviews.restaurantId, restaurantId),
    orderBy: [desc(reviews.createdAt)],
    limit: 20,
    with: {
      user: { columns: { name: true, image: true } },
    },
  });
}

export async function getApprovedRestaurantsCount() {
  const [row] = await db
    .select({ count: count() })
    .from(restaurants)
    .where(inArray(restaurants.status, BOOKABLE_STATUSES));
  return row?.count ?? 0;
}

export async function getRestaurantsByStatus(status?: RestaurantStatus) {
  return db.query.restaurants.findMany({
    where: status ? eq(restaurants.status, status) : undefined,
    orderBy: [desc(restaurants.createdAt)],
    with: { owner: { columns: { name: true, email: true } } },
  });
}

export async function getRestaurantById(id: string) {
  return db.query.restaurants.findFirst({
    where: eq(restaurants.id, id),
    with: { owner: true, reviewer: true, firstApprover: true, presencialVisitByAdmin: true, tables: true },
  });
}

export async function getFeaturedRestaurants(limit = 8) {
  const rows = await db.query.restaurants.findMany({
    where: inArray(restaurants.status, BOOKABLE_STATUSES),
    orderBy: [desc(restaurants.createdAt)],
    limit,
  });
  return attachRatings(rows);
}

async function attachRatings<T extends { id: string }>(rows: T[]) {
  if (rows.length === 0) return rows.map((r) => ({ ...r, avgRating: null as number | null, reviewCount: 0 }));

  const stats = await db
    .select({
      restaurantId: reviews.restaurantId,
      avgRating: avg(reviews.rating),
      reviewCount: count(reviews.id),
    })
    .from(reviews)
    .groupBy(reviews.restaurantId);

  const statsByRestaurant = new Map(stats.map((s) => [s.restaurantId, s]));

  return rows.map((r) => {
    const s = statsByRestaurant.get(r.id);
    return {
      ...r,
      avgRating: s?.avgRating ? Number(s.avgRating) : null,
      reviewCount: s?.reviewCount ?? 0,
    };
  });
}
