import { SearchFilters } from "@/components/search/search-filters";
import { RestaurantCard } from "@/components/search/restaurant-card";
import { EmptyState } from "@/components/search/empty-state";
import { searchRestaurants } from "@/lib/restaurants/queries";
import { RESTAURANT_CATEGORIES } from "@/lib/constants";

const VALID_CATEGORIES = new Set(RESTAURANT_CATEGORIES.map((c) => c.value));

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const category = VALID_CATEGORIES.has(params.category as never)
    ? (params.category as (typeof RESTAURANT_CATEGORIES)[number]["value"])
    : undefined;
  const guests = params.guests ? Number(params.guests) : undefined;

  const restaurants = await searchRestaurants({
    category,
    district: params.district,
    date: params.date,
    timeSlot: params.timeSlot,
    guests: guests && guests > 0 ? guests : undefined,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Restaurantes en Puno
      </h1>
      <p className="mt-1 text-muted-foreground">
        Filtra por categoría, distrito, fecha y hora para ver mesas realmente disponibles.
      </p>

      <div className="mt-6">
        <SearchFilters />
      </div>

      <div className="mt-8">
        {restaurants.length === 0 ? (
          <EmptyState message="No encontramos restaurantes con esos filtros. Prueba con otra fecha, hora o categoría." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
