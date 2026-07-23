import { sql } from "drizzle-orm";
import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { reservationStatusEnum } from "./enums";
import { users } from "./auth";
import { restaurants, tables } from "./restaurants";

export const reservations = pgTable(
  "reservations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "restrict" }),
    tableId: text("table_id")
      .notNull()
      .references(() => tables.id, { onDelete: "restrict" }),
    date: date("date", { mode: "string" }).notNull(),
    timeSlot: time("time_slot").notNull(),
    guests: integer("guests").notNull(),
    serviceFee: numeric("service_fee", { precision: 10, scale: 2 }).notNull(),
    status: reservationStatusEnum("status").notNull().default("pendiente_pago"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
    paidAt: timestamp("paid_at", { mode: "date", withTimezone: true }),
    // Momento en que el anfitrión marcó la llegada (transición a en_curso).
    arrivedAt: timestamp("arrived_at", { mode: "date", withTimezone: true }),
    // Máximo 2 reprogramaciones por reserva (§4.5).
    rescheduleCount: integer("reschedule_count").notNull().default(0),
  },
  (table) => [
    // Índice único parcial: solo bloquea el slot mientras la reserva sigue
    // activa (pendiente de pago, confirmada o en curso). Si se cancela,
    // expira o termina, el slot vuelve a quedar libre para otra reserva.
    uniqueIndex("reservations_table_date_slot_unique")
      .on(table.tableId, table.date, table.timeSlot)
      .where(sql`${table.status} IN ('pendiente_pago', 'confirmada', 'en_curso')`),
  ],
);
