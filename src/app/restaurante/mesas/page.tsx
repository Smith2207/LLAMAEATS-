import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { TableList } from "@/components/dashboard-restaurante/table-list";
import { TableForm } from "@/components/dashboard-restaurante/table-form";
import { EmptyState } from "@/components/search/empty-state";

export default async function MesasPage() {
  const session = await requireRole("restaurante");
  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) redirect("/restaurante");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Mesas</h1>
        <TableForm />
      </div>

      <div className="mt-6">
        {restaurant.tables.length === 0 ? (
          <EmptyState message="Todavía no registraste mesas. Agrega la primera para empezar a recibir reservas." />
        ) : (
          <TableList tables={restaurant.tables} />
        )}
      </div>
    </main>
  );
}
