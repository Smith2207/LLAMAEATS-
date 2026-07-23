"use server";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { accounts, reviews, sessions, users } from "@/db/schema";
import { authActionClient, roleActionClient } from "@/lib/actions/safe-action";
import { getUserReservations } from "@/lib/reservations/queries";

// Autoservicio de acceso (§11, Ley 29733): junta todo lo asociado a la
// cuenta en un JSON descargable. Solo datos propios — nunca de terceros.
export const exportMyDataAction = authActionClient
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    const [user, reservations, myReviews] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
        columns: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      }),
      getUserReservations(ctx.user.id),
      db.query.reviews.findMany({
        where: eq(reviews.userId, ctx.user.id),
        columns: { restaurantId: true, rating: true, comment: true, createdAt: true },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      profile: user,
      reservations: reservations.map((r) => ({
        code: r.code,
        restaurant: r.restaurant?.name ?? null,
        date: r.date,
        timeSlot: r.timeSlot,
        guests: r.guests,
        status: r.status,
        serviceFee: r.serviceFee,
      })),
      reviews: myReviews,
    };
  });

// Baja de cuenta (§11): solo para clientes por ahora — un restaurante
// dueño de un local activo no puede autoeliminarse sin dejar el negocio
// huérfano, así que ese caso lo resuelve soporte manualmente. Anonimiza en
// vez de borrar la fila (las reservas/pagos quedan intactos para
// contabilidad) y corta el login: borra accounts (vínculo OAuth) y
// sessions (cierra sesión en todos lados).
export const deleteMyAccountAction = roleActionClient("cliente")
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    await db
      .update(users)
      .set({
        name: "Usuario eliminado",
        email: `deleted-${ctx.user.id}@llamaeats.invalid`,
        phone: null,
        image: null,
        deletedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.id));

    await db.delete(accounts).where(eq(accounts.userId, ctx.user.id));
    await db.delete(sessions).where(eq(sessions.userId, ctx.user.id));

    const store = await cookies();
    store.delete("authjs.session-token");
    store.delete("__Secure-authjs.session-token");

    return { ok: true };
  });
