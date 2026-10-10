ALTER TABLE "user" ADD COLUMN "role_level" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_level_range" CHECK ("role_level" between 0 and 100);