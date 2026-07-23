"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, reservations, restaurants, users } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { reservationCodeSchema } from "@/lib/validations/reservation";
import { getPaymentProvider } from "@/lib/payments";
import { sendReservationCancelledEmail } from "@/lib/email/send";
import { FREE_CANCELLATION_WINDOW_HOURS } from "@/lib/constants";
import { reservationInstant } from "@/lib/reservations/time";

export const cancelReservationAction = authActionClient
  .inputSchema(reservationCodeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await db.transaction(async (tx) => {
      const [reservation] = await tx
        .select()
        .from(reservations)
        .where(eq(reservations.code, parsedInput.code))
        .for("update");

      if (!reservation) throw new Error("Reserva no encontrada.");

      const restaurant = await tx.query.restaurants.findFirst({
        where: eq(restaurants.id, reservation.restaurantId),
      });

      const isOwner = reservation.userId === ctx.user.id;
      const isRestaurantOwner =
        ctx.user.role === "restaurante" && restaurant?.ownerId === ctx.user.id;
      const isAdmin = ctx.user.role === "admin";

      if (!isOwner && !isRestaurantOwner && !isAdmin) {
        throw new Error("No tienes permiso para cancelar esta reserva.");
      }
      if (!["pendiente_pago", "confirmada"].includes(reservation.status)) {
        throw new Error("Esta reserva ya no se puede cancelar.");
      }

      const slotDateTime = reservationInstant(reservation.date, reservation.timeSlot);
      const hoursUntil = (slotDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      // Reembolso total salvo que sea el propio cliente cancelando con
      // menos de 2h de anticipación.
      const clienteInitiated = isOwner && ctx.user.role === "cliente";
      const eligibleForRefund = !clienteInitiated || hoursUntil > FREE_CANCELLATION_WINDOW_HOURS;

      // El estado refleja quién canceló (§4.5): si lo hace el restaurante o
      // un admin en su nombre, siempre reembolso total + queda registrado
      // como cancelación del local (afecta su historial), no del comensal.
      const newStatus = clienteInitiated ? "cancelada_comensal" : "cancelada_local";

      await tx
        .update(reservations)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(reservations.id, reservation.id));

      let refunded = false;
      if (eligibleForRefund) {
        const [payment] = await tx
          .select()
          .from(payments)
          .where(and(eq(payments.reservationId, reservation.id), eq(payments.status, "completado")));

        if (payment) {
          const provider = getPaymentProvider();
          const refund = await provider.refund(payment.reference ?? "");
          if (refund.success) {
            await tx.update(payments).set({ status: "reembolsado" }).where(eq(payments.id, payment.id));
            refunded = true;
          }
        }
      }

      const owner = await tx.query.users.findFirst({ where: eq(users.id, reservation.userId) });

      return { reservation, restaurant, refunded, ownerEmail: owner?.email };
    });

    try {
      if (result.ownerEmail && result.restaurant) {
        await sendReservationCancelledEmail({
          to: result.ownerEmail,
          restaurantName: result.restaurant.name,
          date: result.reservation.date,
          timeSlot: result.reservation.timeSlot,
          code: result.reservation.code,
          refunded: result.refunded,
        });
      }
    } catch (err) {
      console.error("No se pudo enviar el email de cancelación", err);
    }

    return { refunded: result.refunded };
  });
