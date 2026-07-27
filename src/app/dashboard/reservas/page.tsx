import { requireRole } from "@/lib/auth/session";
import { getUserReservations } from "@/lib/reservations/queries";
import { getUserWaitlistEntries } from "@/lib/waitlist/queries";
import { ReservationCard } from "@/components/dashboard-cliente/reservation-card";
import { WaitlistEntryCard } from "@/components/dashboard-cliente/waitlist-entry-card";
import { EmptyState } from "@/components/search/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { todayInLima } from "@/lib/reservations/time";

export default async function MisReservasPage() {
  const session = await requireRole("cliente");
  const [reservations, waitlistEntries] = await Promise.all([
    getUserReservations(session.user.id),
    getUserWaitlistEntries(session.user.id),
  ]);
  const today = todayInLima();

  const ACTIVE_STATUSES = ["pendiente_pago", "confirmada", "en_curso"];
  const proximas = reservations.filter(
    (r) => r.date >= today && ACTIVE_STATUSES.includes(r.status),
  );
  const pasadas = reservations.filter(
    (r) => !(r.date >= today && ACTIVE_STATUSES.includes(r.status)),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Mis reservas</h1>

      <Tabs defaultValue="proximas" className="mt-6">
        <TabsList>
          <TabsTrigger value="proximas">Próximas ({proximas.length})</TabsTrigger>
          <TabsTrigger value="pasadas">Historial ({pasadas.length})</TabsTrigger>
          <TabsTrigger value="espera">Lista de espera ({waitlistEntries.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="proximas" className="mt-4 flex flex-col gap-3">
          {proximas.length === 0 ? (
            <EmptyState message="No tienes reservas próximas. ¡Busca un restaurante y asegura tu mesa!" />
          ) : (
            proximas.map((r, i) => <ReservationCard key={r.code} reservation={r} index={i} />)
          )}
        </TabsContent>
        <TabsContent value="pasadas" className="mt-4 flex flex-col gap-3">
          {pasadas.length === 0 ? (
            <EmptyState message="Todavía no tienes historial de reservas." />
          ) : (
            pasadas.map((r, i) => <ReservationCard key={r.code} reservation={r} index={i} />)
          )}
        </TabsContent>
        <TabsContent value="espera" className="mt-4 flex flex-col gap-3">
          {waitlistEntries.length === 0 ? (
            <EmptyState message="No estás en ninguna lista de espera. Si un horario está lleno, puedes anotarte desde el paso de elegir mesa." />
          ) : (
            waitlistEntries.map((entry) => <WaitlistEntryCard key={entry.id} entry={entry} />)
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
