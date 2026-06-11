CREATE TYPE "public"."interest_type" AS ENUM('tech', 'non_tech');--> statement-breakpoint
CREATE TABLE "interests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "interests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "interest_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_interests" (
	"profile_id" integer NOT NULL,
	"interest_id" integer NOT NULL,
	CONSTRAINT "profile_interests_profile_id_interest_id_pk" PRIMARY KEY("profile_id","interest_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "speakers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"company" text,
	"avatar_url" text,
	"bio" text
);
--> statement-breakpoint
CREATE TABLE "talk_speakers" (
	"talk_id" integer NOT NULL,
	"speaker_id" integer NOT NULL,
	CONSTRAINT "talk_speakers_talk_id_speaker_id_pk" PRIMARY KEY("talk_id","speaker_id")
);
--> statement-breakpoint
CREATE TABLE "talks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "talks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text,
	"track_id" integer,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tracks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "tracks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talk_speakers" ADD CONSTRAINT "talk_speakers_talk_id_talks_id_fk" FOREIGN KEY ("talk_id") REFERENCES "public"."talks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talk_speakers" ADD CONSTRAINT "talk_speakers_speaker_id_speakers_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talks" ADD CONSTRAINT "talks_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE no action ON UPDATE no action;