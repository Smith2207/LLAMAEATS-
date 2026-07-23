"use server";

import { roleActionClient } from "@/lib/actions/safe-action";
import { requireOwnedRestaurant } from "@/lib/restaurants/owner";
import { getAvailableTables } from "@/lib/reservations/availability";
import { staffTablesQuerySchema } from "@/lib/validations/manual-reservation";

// A diferencia de getAvailableTablesAction (comensal), esta consulta
// incluye mesas reservadas solo para mostrador (platformOnly: false) — el
// anfitrión sí puede usarlas para una reserva telefónica — y está acotada
// al propio restaurante del que hace la consulta, nunca a otro.
export const getStaffAvailableTablesAction = roleActionClient("restaurante")
  .inputSchema(staffTablesQuerySchema)
  .action(async ({ parsedInput, ctx }) => {
    const restaurant = await requireOwnedRestaurant(ctx.user.id);

    const availableTables = await getAvailableTables({
      restaurantId: restaurant.id,
      date: parsedInput.date,
      timeSlot: parsedInput.timeSlot,
      guests: parsedInput.guests,
      turnoverBufferMinutes: restaurant.turnoverBufferMinutes,
      platformOnly: false,
    });

    return { tables: availableTables };
  });
