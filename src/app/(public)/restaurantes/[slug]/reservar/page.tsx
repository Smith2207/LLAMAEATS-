import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/restaurants/queries";
import { requireSession } from "@/lib/auth/session";
import { ReservationWizard } from "@/components/reservation/reservation-wizard";

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireSession(`/restaurantes/${slug}/reservar`);

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Reservar en {restaurant.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Elige fecha, hora y mesa. Pagas solo la tarifa de servicio, no la cuenta.
      </p>

      <div className="mt-6">
        <ReservationWizard restaurantId={restaurant.id} restaurantName={restaurant.name} />
      </div>
    </main>
  );
}
