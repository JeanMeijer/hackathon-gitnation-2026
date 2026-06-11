import { talks, tracks, speakers, talkSpeakers } from "./schema";

export type Talk = typeof talks.$inferSelect;

export type Speaker = typeof speakers.$inferSelect;

export type TalkSpeaker = typeof talkSpeakers.$inferSelect;

export type Track = typeof tracks.$inferSelect;
