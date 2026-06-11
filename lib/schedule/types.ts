export type ScheduleEventType = "talk" | "custom" | "meeting" | "break";

interface ScheduleEventBase {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export interface TalkScheduleEvent extends ScheduleEventBase {
  type: "talk";
  talkId: number;
  trackName?: string;
}

export interface CustomScheduleEvent extends ScheduleEventBase {
  type: "custom";
  description?: string;
  location?: string;
}

export interface MeetingScheduleEvent extends ScheduleEventBase {
  type: "meeting";
  location?: string;
  attendees?: string[];
}

export interface BreakScheduleEvent extends ScheduleEventBase {
  type: "break";
  location?: string;
}

export type ScheduleEvent =
  | TalkScheduleEvent
  | CustomScheduleEvent
  | MeetingScheduleEvent
  | BreakScheduleEvent;

export interface ConferenceDateRange {
  start: Date;
  end: Date;
}
