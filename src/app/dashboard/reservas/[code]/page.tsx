import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getReservationByCode } from "@/lib/reservations/queries";
import { generateQrDataUrl } from "@/lib/qr/qr";
import { QrCodeCard } from "@/components/reservation/qr-code-card";
import { CancelReservationButton } from "@/components/reservation/cancel-reservation-button";
import { ReviewForm } from "@/components/restaurant-detail/review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESERVATION_STATUS_LABELS } from "@/lib/constants";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await requireRole("cliente");

  const reservation = await getReservationByCode(code);
  if (!reservation || reservation.userId !== session.user.id) notFound();

  const qrDataUrl = await generateQrDataUrl(reservation.code);
  const canManage = reservation.status === "pendiente" || reservation.status === "confirmada";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {reservation.restaurant.name}
        </h1>
        <Badge>{RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status}</Badge>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {reservation.date} · {reservation.timeSlot.slice(0, 5)} · {reservation.guests}{" "}
        {reservation.guests === 1 ? "persona" : "personas"} · Mesa {reservation.table.number} (
        {reservation.table.zone})
      </p>

      {reservation.status === "confirmada" && (
        <div className="mt-6">
          <QrCodeCard code={reservation.code} qrDataUrl={qrDataUrl} />
        </div>
      )}

      {canManage && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/reservas/${reservation.code}/reprogramar`}>Reprogramar</Link>
          </Button>
          <CancelReservationButton code={reservation.code} />
        </div>
      )}

      {reservation.status === "completada" && !reservation.review && (
        <div className="mt-6">
          <ReviewForm reservationCode={reservation.code} />
        </div>
      )}

      {reservation.review && (
        <p className="mt-6 text-sm text-muted-foreground">Ya dejaste tu reseña para esta visita. ¡Gracias!</p>
      )}
    </main>
  );
}
