import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import {
  getRestaurantOccupancyByDay,
  getRestaurantCommissionByDay,
  getRestaurantCommissionSummary,
} from "@/lib/reservations/stats";
import { OccupancyChart } from "@/components/dashboard-restaurante/occupancy-charts";
import { CommissionChart } from "@/components/dashboard-restaurante/commission-chart";

export default async function MetricasPage() {
  const session = await requireRole("restaurante");
  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) redirect("/restaurante");

  const [occupancy, commissionByDay, commissionSummary] = await Promise.all([
    getRestaurantOccupancyByDay(restaurant.id, 14),
    getRestaurantCommissionByDay(restaurant.id, 14),
    getRestaurantCommissionSummary(restaurant.id),
  ]);
  const total = occupancy.reduce((sum, d) => sum + d.reservas, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Métricas de ocupación</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} reservas confirmadas en los últimos 14 días.
      </p>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <OccupancyChart data={occupancy} />
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-foreground">
        Comisión con LlamaEats
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        S/ {commissionSummary.pendiente.toFixed(2)} pendiente de liquidar · S/{" "}
        {commissionSummary.liquidado.toFixed(2)} ya liquidado.
      </p>

      <div className="mt-4 rounded-xl border border-border/60 bg-card p-4">
        <CommissionChart data={commissionByDay} />
      </div>
    </main>
  );
}
