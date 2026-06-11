CREATE TABLE "conference_profiles" (
	"conference_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	CONSTRAINT "conference_profiles_conference_id_profile_id_pk" PRIMARY KEY("conference_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "conferences" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conferences_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"registration_ends_at" timestamp with time zone NOT NULL,
	"registration_closed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO "conferences" ("name", "registration_ends_at", "registration_closed") VALUES ('GitNation 2026', now(), false);--> statement-breakpoint
ALTER TABLE "talks" ADD COLUMN "conference_id" integer;--> statement-breakpoint
UPDATE "talks" SET "conference_id" = (SELECT "id" FROM "conferences" ORDER BY "id" LIMIT 1) WHERE "conference_id" IS NULL;--> statement-breakpoint
ALTER TABLE "talks" ALTER COLUMN "conference_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "conference_profiles" ADD CONSTRAINT "conference_profiles_conference_id_conferences_id_fk" FOREIGN KEY ("conference_id") REFERENCES "public"."conferences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conference_profiles" ADD CONSTRAINT "conference_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talks" ADD CONSTRAINT "talks_conference_id_conferences_id_fk" FOREIGN KEY ("conference_id") REFERENCES "public"."conferences"("id") ON DELETE cascade ON UPDATE no action;
