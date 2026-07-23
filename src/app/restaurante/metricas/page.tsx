import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { getRestaurantOccupancyByDay } from "@/lib/reservations/stats";
import { OccupancyChart } from "@/components/dashboard-restaurante/occupancy-charts";

export default async function MetricasPage() {
  const session = await requireRole("restaurante");
  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) redirect("/restaurante");

  const data = await getRestaurantOccupancyByDay(restaurant.id, 14);
  const total = data.reduce((sum, d) => sum + d.reservas, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Métricas de ocupación</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} reservas confirmadas en los últimos 14 días.
      </p>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <OccupancyChart data={data} />
      </div>
    </main>
  );
}
