import { formatPEN } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";

export function KpiCards({
  totalReservations,
  totalRevenue,
  cancellationRate,
  approvedRestaurants,
}: {
  totalReservations: number;
  totalRevenue: number;
  cancellationRate: number;
  approvedRestaurants: number;
}) {
  const items = [
    { label: "Reservas (14 días)", value: totalReservations.toLocaleString("es-PE") },
    { label: "Ingresos (14 días)", value: formatPEN(totalRevenue) },
    { label: "Tasa de cancelación (30 días)", value: `${(cancellationRate * 100).toFixed(1)}%` },
    { label: "Restaurantes aprobados", value: approvedRestaurants.toLocaleString("es-PE") },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <StatCard key={item.label} label={item.label} value={item.value} index={i} />
      ))}
    </div>
  );
}
