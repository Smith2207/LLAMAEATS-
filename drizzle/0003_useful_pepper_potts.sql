CREATE TYPE "public"."risk_level" AS ENUM('bajo', 'medio', 'alto');--> statement-breakpoint
ALTER TABLE "restaurants" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "restaurants" ALTER COLUMN "status" SET DEFAULT 'enviada'::text;--> statement-breakpoint
UPDATE "restaurants" SET "status" = 'enviada' WHERE "status" = 'pendiente';--> statement-breakpoint
UPDATE "restaurants" SET "status" = 'activa' WHERE "status" = 'aprobado';--> statement-breakpoint
UPDATE "restaurants" SET "status" = 'rechazada' WHERE "status" = 'rechazado';--> statement-breakpoint
DROP TYPE "public"."restaurant_status";--> statement-breakpoint
CREATE TYPE "public"."restaurant_status" AS ENUM('enviada', 'en_revision', 'observada', 'aprobada', 'activa', 'pausada', 'suspendida', 'rechazada', 'caducada', 'dada_de_baja');--> statement-breakpoint
ALTER TABLE "restaurants" ALTER COLUMN "status" SET DEFAULT 'enviada'::"public"."restaurant_status";--> statement-breakpoint
ALTER TABLE "restaurants" ALTER COLUMN "status" SET DATA TYPE "public"."restaurant_status" USING "status"::"public"."restaurant_status";--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "risk_level" "risk_level";--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "risk_signals" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "reviewer_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "review_locked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "observation_note" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "observation_deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "first_approver_id" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "max_trial_reservations" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "last_ruc_check_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "paused_reason" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_first_approver_id_users_id_fk" FOREIGN KEY ("first_approver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;