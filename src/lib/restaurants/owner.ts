import { eq } from "drizzle-orm";
import { db } from "@/db";
import { restaurants } from "@/db/schema";

export async function getOwnedRestaurant(ownerId: string) {
  return db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, ownerId),
    with: { tables: true },
  });
}

export async function requireOwnedRestaurant(ownerId: string) {
  const restaurant = await getOwnedRestaurant(ownerId);
  if (!restaurant) throw new Error("No tienes un restaurante registrado.");
  return restaurant;
}
