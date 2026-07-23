import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getReservationByCode } from "@/lib/reservations/queries";
import { RescheduleWizard } from "@/components/reservation/reschedule-wizard";

export default async function ReprogramarPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await requireRole("cliente");

  const reservation = await getReservationByCode(code);
  if (!reservation || reservation.userId !== session.user.id) notFound();
  if (!["pendiente_pago", "confirmada"].includes(reservation.status)) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Reprogramar reserva en {reservation.restaurant.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Elige una nueva fecha, hora y mesa para tu grupo de {reservation.guests}{" "}
        {reservation.guests === 1 ? "persona" : "personas"}.
      </p>

      <div className="mt-6 glass rounded-2xl p-6">
        <RescheduleWizard
          code={reservation.code}
          restaurantId={reservation.restaurantId}
          guests={reservation.guests}
        />
      </div>
    </main>
  );
}
