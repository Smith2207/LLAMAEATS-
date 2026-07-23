import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { getRestaurantReservationsForDate } from "@/lib/reservations/queries";
import { ReservationsInbox } from "@/components/dashboard-restaurante/reservations-inbox";
import { DateFilterInput } from "@/components/dashboard-restaurante/date-filter-input";
import { ManualReservationDialog } from "@/components/dashboard-restaurante/manual-reservation-dialog";
import { QuickCloseToday } from "@/components/dashboard-restaurante/quick-close-today";
import { PrintAgendaButton } from "@/components/dashboard-restaurante/print-agenda-button";
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
  const today = todayInLima();
  const selectedDate = date || today;
  const reservations = await getRestaurantReservationsForDate(restaurant.id, selectedDate);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:block">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Reservas del día</h1>
          <p className="hidden text-sm text-muted-foreground print:block">
            {restaurant.name} — {selectedDate}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <DateFilterInput defaultValue={selectedDate} />
          <PrintAgendaButton />
          {selectedDate === today && <QuickCloseToday today={today} />}
          <ManualReservationDialog
            defaultDate={selectedDate}
            openTime={restaurant.openTime.slice(0, 5)}
            closeTime={restaurant.closeTime.slice(0, 5)}
          />
        </div>
      </div>

      <div className="mt-6">
        <ReservationsInbox reservations={reservations} />
      </div>
    </main>
  );
}
