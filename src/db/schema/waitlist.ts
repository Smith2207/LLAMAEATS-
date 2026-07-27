import { sql } from "drizzle-orm";
import { date, integer, pgTable, text, time, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { waitlistStatusEnum } from "./enums";
import { users } from "./auth";
import { restaurants } from "./restaurants";

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    timeSlot: time("time_slot").notNull(),
    guests: integer("guests").notNull(),
    status: waitlistStatusEnum("status").notNull().default("activa"),
    notifiedAt: timestamp("notified_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Un solo apunte activo por comensal/restaurante/horario a la vez —
    // evita que alguien se anote dos veces al mismo slot mientras espera.
    uniqueIndex("waitlist_user_restaurant_date_slot_unique")
      .on(table.userId, table.restaurantId, table.date, table.timeSlot)
      .where(sql`${table.status} IN ('activa', 'notificada')`),
  ],
);
