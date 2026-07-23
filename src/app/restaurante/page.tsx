import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { getRestaurantReservationsForDate } from "@/lib/reservations/queries";
import { RestaurantForm } from "@/components/dashboard-restaurante/restaurant-form";
import { LifecycleActions } from "@/components/dashboard-restaurante/lifecycle-actions";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESTAURANT_STATUS_LABELS } from "@/lib/constants";
import { todayInLima } from "@/lib/reservations/time";

const RESUBMITTABLE = ["observada", "rechazada", "caducada"];

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

  if (RESUBMITTABLE.includes(restaurant.status)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">{restaurant.name}</h1>
          <Badge variant="outline">{RESTAURANT_STATUS_LABELS[restaurant.status]}</Badge>
        </div>

        {restaurant.observationNote && (
          <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
            <p className="font-medium text-terracota-400">
              {restaurant.status === "rechazada" ? "Motivo del rechazo" : "Qué debes corregir"}
            </p>
            <p className="mt-1 text-foreground">{restaurant.observationNote}</p>
            {restaurant.observationDeadline && restaurant.status === "observada" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Tienes hasta el {restaurant.observationDeadline.toISOString().slice(0, 10)} para reenviar.
              </p>
            )}
          </div>
        )}
        {restaurant.status === "caducada" && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            El plazo para responder venció. Corrige y reenvía tu solicitud para volver a la cola.
          </p>
        )}

        <div className="mt-6">
          <RestaurantForm
            mode="resubmit"
            defaultValues={{
              name: restaurant.name,
              description: restaurant.description ?? "",
              address: restaurant.address ?? "",
              district: restaurant.district,
              category: restaurant.category,
              ruc: restaurant.ruc ?? "",
              openTime: restaurant.openTime.slice(0, 5),
              closeTime: restaurant.closeTime.slice(0, 5),
            }}
          />
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
        <Badge variant={["aprobada", "activa"].includes(restaurant.status) ? "default" : "outline"}>
          {RESTAURANT_STATUS_LABELS[restaurant.status] ?? restaurant.status}
        </Badge>
      </div>

      {["enviada", "en_revision"].includes(restaurant.status) && (
        <p className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-terracota-400">
          Tu solicitud está en revisión. Podrás recibir reservas apenas sea aprobada.
        </p>
      )}
      {restaurant.status === "aprobada" && restaurant.trialEndsAt && (
        <p className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-terracota-400">
          Estás en período de prueba hasta el {restaurant.trialEndsAt.toISOString().slice(0, 10)} — máximo{" "}
          {restaurant.maxTrialReservations} reservas simultáneas mientras dure.
        </p>
      )}
      {restaurant.status === "pausada" && (
        <p className="mt-3 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
          {restaurant.pausedReason ?? "Tu restaurante está pausado y no recibe reservas nuevas."}
        </p>
      )}
      {restaurant.status === "suspendida" && (
        <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Tu restaurante fue suspendido por el equipo de LlamaEats
          {restaurant.pausedReason ? `: ${restaurant.pausedReason}` : "."} Contacta a soporte.
        </p>
      )}
      {restaurant.status === "dada_de_baja" && (
        <p className="mt-3 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
          Este restaurante fue dado de baja. Contacta a soporte si quieres reactivarlo.
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

      <div className="mt-4">
        <LifecycleActions restaurantId={restaurant.id} status={restaurant.status} />
      </div>
    </main>
  );
}
