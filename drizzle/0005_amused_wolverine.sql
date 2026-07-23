ALTER TABLE "restaurants" ADD COLUMN "representative_name" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "representative_document" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "representative_role" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "representative_email" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "representative_phone" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "representative_email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "representative_email_code_hash" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "representative_email_code_expires_at" timestamp with time zone;