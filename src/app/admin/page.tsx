import { requireRole } from "@/lib/auth/session";
import { getApprovedRestaurantsCount } from "@/lib/restaurants/queries";
import {
  getCancellationRate,
  getPlatformStatsByDay,
  getTopRestaurants,
} from "@/lib/reservations/stats";
import { KpiCards } from "@/components/dashboard-admin/kpi-cards";
import { ReservationsByDayChart } from "@/components/dashboard-admin/charts/reservations-by-day-chart";
import { RevenueChart } from "@/components/dashboard-admin/charts/revenue-chart";
import { CancellationRateChart } from "@/components/dashboard-admin/charts/cancellation-rate-chart";
import { Top5Chart } from "@/components/dashboard-admin/charts/top5-chart";

export default async function AdminPage() {
  await requireRole("admin");

  const [byDay, cancellation, top5, approvedCount] = await Promise.all([
    getPlatformStatsByDay(14),
    getCancellationRate(30),
    getTopRestaurants(5),
    getApprovedRestaurantsCount(),
  ]);

  const totalReservations = byDay.reduce((sum, d) => sum + d.reservas, 0);
  const totalRevenue = byDay.reduce((sum, d) => sum + d.ingresos, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="mt-6">
        <KpiCards
          totalReservations={totalReservations}
          totalRevenue={totalRevenue}
          cancellationRate={cancellation.rate}
          approvedRestaurants={approvedCount}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Reservas por día</p>
          <ReservationsByDayChart data={byDay} />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Ingresos por tarifa de servicio</p>
          <RevenueChart data={byDay} />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Tasa de cancelación</p>
          <CancellationRateChart cancelled={cancellation.cancelled} total={cancellation.total} />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Top 5 restaurantes por reservas</p>
          {top5.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay suficientes datos.</p>
          ) : (
            <Top5Chart data={top5.map((r) => ({ name: r.name, count: r.count }))} />
          )}
        </div>
      </div>
    </main>
  );
}
