import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { getRestaurantReservationsForDate } from "@/lib/reservations/queries";
import { ReservationsInbox } from "@/components/dashboard-restaurante/reservations-inbox";
import { DateFilterInput } from "@/components/dashboard-restaurante/date-filter-input";
import { todayInLima } from "@/lib/reservations/time";

export default async function RestauranteReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await requireRole("restaurante");
  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) redirect("/restaurante");

  const { date } = await searchParams;
  const selectedDate = date || todayInLima();
  const reservations = await getRestaurantReservationsForDate(restaurant.id, selectedDate);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Reservas del día</h1>
        <DateFilterInput defaultValue={selectedDate} />
      </div>

      <div className="mt-6">
        <ReservationsInbox reservations={reservations} />
      </div>
    </main>
  );
}
