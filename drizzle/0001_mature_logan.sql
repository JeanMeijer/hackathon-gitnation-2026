ALTER TABLE "interests" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "description" text;