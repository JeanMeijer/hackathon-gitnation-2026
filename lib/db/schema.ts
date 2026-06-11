import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const interestTypeEnum = pgEnum("interest_type", ["tech", "non_tech"]);

export const profiles = pgTable("profiles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  title: text(),
  company: text(),
  description: text(),
});

export const interests = pgTable("interests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  type: interestTypeEnum().notNull(),
});

export const conferences = pgTable("conferences", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  registrationEndsAt: timestamp({ withTimezone: true }).notNull(),
  registrationClosed: boolean().notNull().default(false),
});

export const conferenceProfiles = pgTable(
  "conference_profiles",
  {
    conferenceId: integer()
      .notNull()
      .references(() => conferences.id, { onDelete: "cascade" }),
    profileId: integer()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.conferenceId, t.profileId] })],
);

export const tracks = pgTable("tracks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
});

export const speakers = pgTable("speakers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  company: text(),
  avatarUrl: text(),
  bio: text(),
});

export const talks = pgTable("talks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  description: text(),
  conferenceId: integer()
    .notNull()
    .references(() => conferences.id, { onDelete: "cascade" }),
  trackId: integer().references(() => tracks.id),
  startsAt: timestamp({ withTimezone: true }).notNull(),
  endsAt: timestamp({ withTimezone: true }),
});

export const talkSpeakers = pgTable(
  "talk_speakers",
  {
    talkId: integer()
      .notNull()
      .references(() => talks.id, { onDelete: "cascade" }),
    speakerId: integer()
      .notNull()
      .references(() => speakers.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.talkId, t.speakerId] })],
);

export const profileInterests = pgTable(
  "profile_interests",
  {
    profileId: integer()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    interestId: integer()
      .notNull()
      .references(() => interests.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.interestId] })],
);

export const events = pgTable("events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  location: text().notNull(),
  startsAt: timestamp({ withTimezone: true }).notNull(),
  endsAt: timestamp({ withTimezone: true }),
  interests: text().notNull(),
});

export const eventProfiles = pgTable(
  "event_profiles",
  {
    eventId: integer()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    profileId: integer()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.profileId] })],
);

export const conferencesRelations = relations(conferences, ({ many }) => ({
  talks: many(talks),
  profiles: many(conferenceProfiles),
}));

export const conferenceProfilesRelations = relations(
  conferenceProfiles,
  ({ one }) => ({
    conference: one(conferences, {
      fields: [conferenceProfiles.conferenceId],
      references: [conferences.id],
    }),
    profile: one(profiles, {
      fields: [conferenceProfiles.profileId],
      references: [profiles.id],
    }),
  }),
);

export const tracksRelations = relations(tracks, ({ many }) => ({
  talks: many(talks),
}));

export const talksRelations = relations(talks, ({ one, many }) => ({
  conference: one(conferences, {
    fields: [talks.conferenceId],
    references: [conferences.id],
  }),
  track: one(tracks, { fields: [talks.trackId], references: [tracks.id] }),
  speakers: many(talkSpeakers),
}));

export const speakersRelations = relations(speakers, ({ many }) => ({
  talks: many(talkSpeakers),
}));

export const talkSpeakersRelations = relations(talkSpeakers, ({ one }) => ({
  talk: one(talks, { fields: [talkSpeakers.talkId], references: [talks.id] }),
  speaker: one(speakers, {
    fields: [talkSpeakers.speakerId],
    references: [speakers.id],
  }),
}));


export const eventsRelations = relations(events, ({ many }) => ({
  profiles: many(eventProfiles),
}));

export const eventProfilesRelations = relations(eventProfiles, ({ one }) => ({
  event: one(events, {
    fields: [eventProfiles.eventId],
    references: [events.id],
  }),
  profile: one(profiles, {
    fields: [eventProfiles.profileId],
    references: [profiles.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  interests: many(profileInterests),
  events: many(eventProfiles),
  conferences: many(conferenceProfiles),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  profiles: many(profileInterests),
}));

export const profileInterestsRelations = relations(profileInterests, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileInterests.profileId],
    references: [profiles.id],
  }),
  interest: one(interests, {
    fields: [profileInterests.interestId],
    references: [interests.id],
  }),
}));
