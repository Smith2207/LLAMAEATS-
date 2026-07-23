CREATE TYPE "public"."schedule_exception_type" AS ENUM('cerrado', 'horario_especial', 'evento_privado');--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"name" text NOT NULL,
	"scope" text NOT NULL,
	CONSTRAINT "holidays_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "restaurant_schedule_exceptions" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"date" date NOT NULL,
	"type" "schedule_exception_type" NOT NULL,
	"open_time" time,
	"close_time" time,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "reservations_table_date_slot_unique";--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'pendiente_pago'::text;--> statement-breakpoint
UPDATE "reservations" SET "status" = 'pendiente_pago' WHERE "status" = 'pendiente';--> statement-breakpoint
UPDATE "reservations" SET "status" = 'cancelada_comensal' WHERE "status" = 'cancelada';--> statement-breakpoint
DROP TYPE "public"."reservation_status";--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pendiente_pago', 'confirmada', 'en_curso', 'completada', 'expirada', 'cancelada_comensal', 'cancelada_local', 'no_asistio');--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'pendiente_pago'::"public"."reservation_status";--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "status" SET DATA TYPE "public"."reservation_status" USING "status"::"public"."reservation_status";--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "turnover_buffer_minutes" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "last_booking_before_close_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tables" ADD COLUMN "min_seats" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "tables" ADD COLUMN "platform_bookable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "arrived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "reschedule_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurant_schedule_exceptions" ADD CONSTRAINT "restaurant_schedule_exceptions_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_exceptions_restaurant_date_unique" ON "restaurant_schedule_exceptions" USING btree ("restaurant_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_table_date_slot_unique" ON "reservations" USING btree ("table_id","date","time_slot") WHERE "reservations"."status" IN ('pendiente_pago', 'confirmada', 'en_curso');