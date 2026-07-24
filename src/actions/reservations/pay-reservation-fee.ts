"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, reservations, restaurants, users } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { reservationCodeSchema } from "@/lib/validations/reservation";
import { getPaymentProvider } from "@/lib/payments";
import { sendReservationConfirmedEmail, sendNewReservationNotificationEmail } from "@/lib/email/send";
import { RESERVATION_EXPIRY_MINUTES } from "@/lib/constants";

export const payReservationFeeAction = authActionClient
  .inputSchema(reservationCodeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await db.transaction(async (tx) => {
      const [reservation] = await tx
        .select()
        .from(reservations)
        .where(eq(reservations.code, parsedInput.code))
        .for("update");

      if (!reservation || reservation.userId !== ctx.user.id) {
        throw new Error("Reserva no encontrada.");
      }
      if (reservation.status !== "pendiente_pago") {
        throw new Error("Esta reserva ya no está pendiente de pago.");
      }

      const expiresAt = reservation.createdAt.getTime() + RESERVATION_EXPIRY_MINUTES * 60 * 1000;
      if (Date.now() > expiresAt) {
        await tx
          .update(reservations)
          .set({ status: "expirada", updatedAt: new Date() })
          .where(eq(reservations.id, reservation.id));
        throw new Error("El tiempo para pagar esta reserva expiró.");
      }

      const provider = getPaymentProvider();
      const charge = await provider.charge({
        amount: Number(reservation.serviceFee),
        currency: "PEN",
        reservationCode: reservation.code,
        description: `Tarifa de servicio LlamaEats — reserva ${reservation.code}`,
      });

      if (!charge.success) {
        throw new Error(charge.errorMessage);
      }

      await tx.insert(payments).values({
        reservationId: reservation.id,
        amount: reservation.serviceFee,
        provider: provider.id,
        status: "completado",
        reference: charge.reference,
      });

      await tx
        .update(reservations)
        .set({ status: "confirmada", paidAt: new Date(), updatedAt: new Date() })
        .where(eq(reservations.id, reservation.id));

      const restaurant = await tx.query.restaurants.findFirst({
        where: eq(restaurants.id, reservation.restaurantId),
      });

      return { reservation, restaurant };
    });

    const { reservation, restaurant } = result;

    // Best-effort: el email no debe hacer fallar el pago ya confirmado.
    try {
      const user = await db.query.users.findFirst({ where: eq(users.id, ctx.user.id) });
      if (user?.email && restaurant) {
        await sendReservationConfirmedEmail({
          to: user.email,
          restaurantName: restaurant.name,
          date: reservation.date,
          timeSlot: reservation.timeSlot,
          guests: reservation.guests,
          code: reservation.code,
        });
      }
    } catch (err) {
      console.error("No se pudo enviar el email de confirmación", err);
    }

    // Best-effort: avisar al restaurante de que tiene una mesa nueva
    // reservada — antes solo se enteraban si entraban a mirar el panel.
    try {
      if (restaurant) {
        const [owner, customer] = await Promise.all([
          db.query.users.findFirst({ where: eq(users.id, restaurant.ownerId) }),
          db.query.users.findFirst({ where: eq(users.id, ctx.user.id) }),
        ]);
        const notifyEmail =
          restaurant.representativeEmailVerifiedAt && restaurant.representativeEmail
            ? restaurant.representativeEmail
            : owner?.email;

        if (notifyEmail) {
          await sendNewReservationNotificationEmail({
            to: notifyEmail,
            restaurantName: restaurant.name,
            customerName: customer?.name ?? "Cliente",
            customerPhone: customer?.phone ?? null,
            date: reservation.date,
            timeSlot: reservation.timeSlot,
            guests: reservation.guests,
            code: reservation.code,
          });
        }
      }
    } catch (err) {
      console.error("No se pudo notificar al restaurante de la nueva reserva", err);
    }

    return { code: reservation.code };
  });
