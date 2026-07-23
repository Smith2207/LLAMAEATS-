ALTER TABLE "reservations" ADD COLUMN "created_by_staff_id" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "staff_notes" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_created_by_staff_id_users_id_fk" FOREIGN KEY ("created_by_staff_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;