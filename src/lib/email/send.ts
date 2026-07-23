import { sendMail } from "./mailer";
import { MagicLinkEmail } from "./templates/magic-link";
import { ReservationConfirmedEmail } from "./templates/reservation-confirmed";
import { ReservationCancelledEmail } from "./templates/reservation-cancelled";
import { DocumentExpiryWarningEmail } from "./templates/document-expiry-warning";
import { generateQrDataUrl } from "@/lib/qr/qr";

export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  await sendMail({
    to,
    subject: "Tu enlace para iniciar sesión en LlamaEats",
    react: MagicLinkEmail({ url }),
  });
}

export async function sendReservationConfirmedEmail({
  to,
  restaurantName,
  date,
  timeSlot,
  guests,
  code,
}: {
  to: string;
  restaurantName: string;
  date: string;
  timeSlot: string;
  guests: number;
  code: string;
}) {
  const qrDataUrl = await generateQrDataUrl(code);
  await sendMail({
    to,
    subject: `Reserva confirmada en ${restaurantName}`,
    react: ReservationConfirmedEmail({ restaurantName, date, timeSlot, guests, code, qrDataUrl }),
  });
}

export async function sendReservationCancelledEmail({
  to,
  restaurantName,
  date,
  timeSlot,
  code,
  refunded,
}: {
  to: string;
  restaurantName: string;
  date: string;
  timeSlot: string;
  code: string;
  refunded: boolean;
}) {
  await sendMail({
    to,
    subject: `Reserva cancelada — ${restaurantName}`,
    react: ReservationCancelledEmail({ restaurantName, date, timeSlot, code, refunded }),
  });
}

export async function sendDocumentExpiryWarningEmail({
  to,
  restaurantName,
  documents,
}: {
  to: string;
  restaurantName: string;
  documents: { label: string; expiresAt: string }[];
}) {
  await sendMail({
    to,
    subject: `Documentos de ${restaurantName} por vencer`,
    react: DocumentExpiryWarningEmail({ restaurantName, documents }),
  });
}
