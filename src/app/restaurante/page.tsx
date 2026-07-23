import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { getRestaurantReservationsForDate } from "@/lib/reservations/queries";
import { RestaurantForm } from "@/components/dashboard-restaurante/restaurant-form";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESTAURANT_STATUS_LABELS } from "@/lib/constants";
import { todayInLima } from "@/lib/reservations/time";

export default async function RestaurantePage() {
  const session = await requireRole("restaurante");
  const restaurant = await getOwnedRestaurant(session.user.id);

  if (!restaurant) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Registra tu restaurante
        </h1>
        <p className="mt-1 text-muted-foreground">
          Completa estos datos para que el equipo de LlamaEats revise y apruebe tu local.
        </p>
        <div className="mt-6">
          <RestaurantForm />
        </div>
      </main>
    );
  }

  const today = todayInLima();
  const todayReservations = await getRestaurantReservationsForDate(restaurant.id, today);
  const activeToday = todayReservations.filter((r) =>
    ["pendiente_pago", "confirmada", "en_curso"].includes(r.status),
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">{restaurant.name}</h1>
        <Badge variant={restaurant.status === "aprobado" ? "default" : "outline"}>
          {RESTAURANT_STATUS_LABELS[restaurant.status]}
        </Badge>
      </div>

      {restaurant.status === "pendiente" && (
        <p className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
          Tu restaurante está en revisión. Podrás recibir reservas apenas sea aprobado.
        </p>
      )}
      {restaurant.status === "rechazado" && (
        <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Tu solicitud fue rechazada. Contacta a soporte para más información.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Mesas activas"
          value={String(restaurant.tables.filter((t) => t.isActive).length)}
          index={0}
        />
        <StatCard label="Reservas hoy" value={String(activeToday.length)} index={1} />
        <StatCard label="Total de mesas" value={String(restaurant.tables.length)} index={2} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/restaurante/mesas">Gestionar mesas</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/restaurante/reservas">Reservas del día</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/restaurante/metricas">Ver métricas</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/restaurante/perfil">Editar perfil</Link>
        </Button>
      </div>
    </main>
  );
}
