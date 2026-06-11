CREATE TABLE "event_profiles" (
	"event_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	CONSTRAINT "event_profiles_event_id_profile_id_pk" PRIMARY KEY("event_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"location" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"interests" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interests" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "event_profiles" ADD CONSTRAINT "event_profiles_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_profiles" ADD CONSTRAINT "event_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;