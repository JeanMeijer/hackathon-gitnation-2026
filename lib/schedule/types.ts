export type ScheduleEventType = "talk" | "workshop" | "meeting" | "break";

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

export interface WorkshopScheduleEvent extends ScheduleEventBase {
  type: "workshop";
  description?: string;
  location?: string;
}

export interface MeetingScheduleEvent extends ScheduleEventBase {
  type: "meeting";
  location?: string;
  attendees?: string[];
  /** Marks demo-generated meetups, which are not clickable. */
  generated?: boolean;
}

export interface BreakScheduleEvent extends ScheduleEventBase {
  type: "break";
  location?: string;
}

export type ScheduleEvent =
  | TalkScheduleEvent
  | WorkshopScheduleEvent
  | MeetingScheduleEvent
  | BreakScheduleEvent;

export interface ConferenceDateRange {
  start: Date;
  end: Date;
}
