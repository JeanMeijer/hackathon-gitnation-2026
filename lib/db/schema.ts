import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
