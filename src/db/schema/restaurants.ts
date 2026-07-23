import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  restaurantCategoryEnum,
  restaurantStatusEnum,
  riskLevelEnum,
  scheduleExceptionTypeEnum,
} from "./enums";
import { users } from "./auth";

export const restaurants = pgTable("restaurants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  address: text("address"),
  district: text("district").notNull(),
  category: restaurantCategoryEnum("category").notNull(),
  ruc: text("ruc"),
  razonSocial: text("razon_social"),
  sunatEstado: text("sunat_estado"),
  sunatCondicion: text("sunat_condicion"),
  rucVerifiedAt: timestamp("ruc_verified_at", { mode: "date", withTimezone: true }),
  coverBlobUrl: text("cover_blob_url"),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  // Colchón de limpieza/armado entre dos reservas de la misma mesa: una
  // mesa reservada a las 19:30 con bloque de 90 min + 15 de colchón queda
  // ocupada hasta las 21:15, aunque el siguiente bloque de la grilla
  // (21:00) exista — availability.ts la excluye por solape de intervalos.
  turnoverBufferMinutes: integer("turnover_buffer_minutes").notNull().default(15),
  // No se acepta ninguna reserva que empiece dentro de estos minutos antes
  // del cierre (además de que el bloque completo debe caber antes de cerrar).
  lastBookingBeforeCloseMinutes: integer("last_booking_before_close_minutes")
    .notNull()
    .default(0),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: restaurantStatusEnum("status").notNull().default("enviada"),

  // --- Riesgo automático (§3.3), calculado en cada envío/reenvío ---
  riskLevel: riskLevelEnum("risk_level"),
  riskSignals: jsonb("risk_signals").$type<string[]>().notNull().default([]),

  // --- Verificación humana (§3.4) ---
  reviewerId: text("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  reviewLockedAt: timestamp("review_locked_at", { mode: "date", withTimezone: true }),
  observationNote: text("observation_note"),
  observationDeadline: timestamp("observation_deadline", { mode: "date", withTimezone: true }),
  // Aprobación en dos pasos cuando el riesgo es medio/alto: el primer admin
  // que aprueba queda registrado aquí; un SEGUNDO admin distinto debe
  // confirmar para que el estado pase realmente a "aprobada".
  firstApproverId: text("first_approver_id").references(() => users.id, { onDelete: "set null" }),

  // --- Período de prueba (§3.4) ---
  trialEndsAt: timestamp("trial_ends_at", { mode: "date", withTimezone: true }),
  maxTrialReservations: integer("max_trial_reservations").notNull().default(5),

  // --- Vigilancia continua (§3.5) ---
  lastRucCheckAt: timestamp("last_ruc_check_at", { mode: "date", withTimezone: true }),
  pausedReason: text("paused_reason"),

  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
});

export const tables = pgTable("tables", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  restaurantId: text("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  // Capacidad máxima. minSeats acota por abajo (una mesa de 8 no debería
  // ofrecerse por defecto a una reserva de 1 persona un día lleno).
  seats: integer("seats").notNull(),
  minSeats: integer("min_seats").notNull().default(1),
  zone: text("zone").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  // Cupo de reserva vs. cupo libre (§4.3): si el local desactiva esto para
  // una mesa, esa mesa nunca aparece en la disponibilidad de la plataforma
  // aunque esté activa — queda reservada para walk-ins/mostrador.
  platformBookable: boolean("platform_bookable").notNull().default(true),
});

// Excepciones al horario base por fecha: feriados, cierres, horario
// extendido o eventos privados que bloquean el local completo (§4.2).
export const restaurantScheduleExceptions = pgTable(
  "restaurant_schedule_exceptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    type: scheduleExceptionTypeEnum("type").notNull(),
    // Solo aplican cuando type = "horario_especial"; en "cerrado" y
    // "evento_privado" el local no acepta reservas ese día.
    openTime: time("open_time"),
    closeTime: time("close_time"),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("schedule_exceptions_restaurant_date_unique").on(t.restaurantId, t.date)],
);

// Feriados nacionales y fiestas locales de Puno, precargados como
// referencia (§4.2, §13.4). Informativos: no cierran el local
// automáticamente (muchos son temporada alta), pero se muestran al
// comensal y se ofrecen como sugerencia rápida al crear una excepción.
export const holidays = pgTable("holidays", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  date: date("date", { mode: "string" }).notNull().unique(),
  name: text("name").notNull(),
  scope: text("scope").notNull(), // "nacional" | "puno"
});
