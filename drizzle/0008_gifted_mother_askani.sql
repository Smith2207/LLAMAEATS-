CREATE TYPE "public"."waitlist_status" AS ENUM('activa', 'notificada', 'reservada', 'cancelada', 'expirada');--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"restaurant_id" text NOT NULL,
	"date" date NOT NULL,
	"time_slot" time NOT NULL,
	"guests" integer NOT NULL,
	"status" "waitlist_status" DEFAULT 'activa' NOT NULL,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_user_restaurant_date_slot_unique" ON "waitlist_entries" USING btree ("user_id","restaurant_id","date","time_slot") WHERE "waitlist_entries"."status" IN ('activa', 'notificada');