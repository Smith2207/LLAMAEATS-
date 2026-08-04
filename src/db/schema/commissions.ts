import { numeric, pgTable, text, timestamp, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { commissionStatusEnum } from "./enums";
import { reservations } from "./reservations";
import { restaurants } from "./restaurants";
import { users } from "./auth";

export const restaurantCommissions = pgTable(
  "restaurant_commissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reservationId: text("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "restrict" }),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "restrict" }),
    // Personas de la reserva al momento de liberar la mesa — snapshot para
    // que el monto cobrado quede trazable aunque cambien las escalas después.
    guests: integer("guests").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: commissionStatusEnum("status").notNull().default("pendiente"),
    settledAt: timestamp("settled_at", { mode: "date", withTimezone: true }),
    settledByStaffId: text("settled_by_staff_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Una sola comisión por reserva (se genera una vez, al liberar la mesa).
    uniqueIndex("restaurant_commissions_reservation_unique").on(table.reservationId),
  ],
);
