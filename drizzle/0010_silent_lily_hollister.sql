CREATE TYPE "public"."commission_status" AS ENUM('pendiente', 'liquidado');--> statement-breakpoint
CREATE TABLE "restaurant_commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_id" text NOT NULL,
	"restaurant_id" text NOT NULL,
	"guests" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "commission_status" DEFAULT 'pendiente' NOT NULL,
	"settled_at" timestamp with time zone,
	"settled_by_staff_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "restaurant_commissions" ADD CONSTRAINT "restaurant_commissions_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_commissions" ADD CONSTRAINT "restaurant_commissions_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_commissions" ADD CONSTRAINT "restaurant_commissions_settled_by_staff_id_users_id_fk" FOREIGN KEY ("settled_by_staff_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "restaurant_commissions_reservation_unique" ON "restaurant_commissions" USING btree ("reservation_id");