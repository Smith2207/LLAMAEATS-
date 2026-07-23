import { requireRole } from "@/lib/auth/session";
import { getRestaurantsByStatus } from "@/lib/restaurants/queries";
import { RestaurantApprovalCard } from "@/components/dashboard-admin/restaurant-approval-card";
import { EmptyState } from "@/components/search/empty-state";

const STATUSES = [
  { value: "pendiente", label: "Pendientes" },
  { value: "aprobado", label: "Aprobados" },
  { value: "rechazado", label: "Rechazados" },
] as const;

export default async function AdminRestaurantesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status } = await searchParams;
  const activeStatus = STATUSES.find((s) => s.value === status)?.value ?? "pendiente";

  const restaurants = await getRestaurantsByStatus(activeStatus);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Restaurantes</h1>

      <div className="mt-4 flex gap-2">
        {STATUSES.map((s) => (
          <a
            key={s.value}
            href={`/admin/restaurantes?status=${s.value}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              activeStatus === s.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {restaurants.length === 0 ? (
          <EmptyState message="No hay restaurantes en este estado." />
        ) : (
          restaurants.map((r) => <RestaurantApprovalCard key={r.id} restaurant={r} />)
        )}
      </div>
    </main>
  );
}
