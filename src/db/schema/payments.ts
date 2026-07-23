import { sql } from "drizzle-orm";
import {
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { paymentStatusEnum } from "./enums";
import { reservations } from "./reservations";

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reservationId: text("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    provider: text("provider").notNull(),
    status: paymentStatusEnum("status").notNull().default("pendiente"),
    reference: text("reference"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Solo puede existir un pago completado por reserva.
    uniqueIndex("payments_reservation_completed_unique")
      .on(table.reservationId)
      .where(sql`${table.status} = 'completado'`),
  ],
);
