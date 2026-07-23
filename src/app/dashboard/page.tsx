import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getUserReservations } from "@/lib/reservations/queries";
import { ReservationCard } from "@/components/dashboard-cliente/reservation-card";
import { EmptyState } from "@/components/search/empty-state";
import { Button } from "@/components/ui/button";
import { todayInLima } from "@/lib/reservations/time";

export default async function DashboardPage() {
  const session = await requireRole("cliente");
  const reservations = await getUserReservations(session.user.id);
  const today = todayInLima();
  const proximas = reservations
    .filter(
      (r) =>
        r.date >= today &&
        ["pendiente_pago", "confirmada", "en_curso"].includes(r.status),
    )
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Hola, {session.user.name?.split(" ")[0] ?? "viajero"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/buscar">Buscar restaurantes</Link>
        </Button>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-muted-foreground">Próximas reservas</h2>
      {proximas.length === 0 ? (
        <EmptyState message="No tienes reservas próximas. ¡Busca un restaurante y asegura tu mesa!" />
      ) : (
        <div className="flex flex-col gap-3">
          {proximas.map((r, i) => (
            <ReservationCard key={r.code} reservation={r} index={i} />
          ))}
        </div>
      )}

      <Button asChild variant="link" className="mt-4 px-0">
        <Link href="/dashboard/reservas">Ver todas mis reservas →</Link>
      </Button>
    </main>
  );
}
