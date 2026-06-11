import { relations } from "drizzle-orm";
import {
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
});

export const interests = pgTable("interests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: interestTypeEnum().notNull(),
});

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

export const tracksRelations = relations(tracks, ({ many }) => ({
  talks: many(talks),
}));

export const talksRelations = relations(talks, ({ one, many }) => ({
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


export const profilesRelations = relations(profiles, ({ many }) => ({
  interests: many(profileInterests),
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
