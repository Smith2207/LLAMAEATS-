ALTER TABLE "restaurants" ADD COLUMN "municipal_license_url" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "municipal_license_number" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "municipal_license_expires_at" date;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "health_certificate_url" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "health_certificate_expires_at" date;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "document_expiry_warned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "presencial_visit_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "presencial_visit_note" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "presencial_visit_by_admin_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_presencial_visit_by_admin_id_users_id_fk" FOREIGN KEY ("presencial_visit_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;