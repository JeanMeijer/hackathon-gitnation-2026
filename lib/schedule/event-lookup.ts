import { DEFAULT_VENUE_ADDRESS } from "@/lib/map/venue-location";
import { getBookedMeetings } from "./booked-meetings";
import { getCustomScheduleEvents } from "./custom-events";
import { MOCK_EVENT_DETAILS } from "./mock-event-details";
import { MOCK_CONFERENCE_SCHEDULE } from "./mock-conference-schedule";
import { MOCK_USER_SCHEDULE } from "./mock-events";
import { EVENT_TYPE_THEME } from "./event-type-theme";
import type { ScheduleEvent, ScheduleEventType } from "./types";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

function cloneEvent(event: ScheduleEvent): ScheduleEvent {
  return {
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  };
}

export function getMockEventById(id: string): ScheduleEvent | undefined {
  return getScheduleEventById(id);
}

export function getScheduleEventById(id: string): ScheduleEvent | undefined {
  const event =
    MOCK_USER_SCHEDULE.find((item) => item.id === id) ??
    MOCK_CONFERENCE_SCHEDULE.find((item) => item.id === id) ??
    getCustomScheduleEvents().find((item) => item.id === id) ??
    getBookedMeetings().find((item) => item.id === id);
  return event ? cloneEvent(event) : undefined;
}

export function isConferenceEvent(event: ScheduleEvent): boolean {
  return MOCK_CONFERENCE_SCHEDULE.some((item) => item.id === event.id);
}

export function getEventTypeLabel(type: ScheduleEventType): string {
  return EVENT_TYPE_THEME[type]?.label ?? type;
}

export function getEventDescription(event: ScheduleEvent): string {
  if (event.type === "workshop" && event.description) {
    return event.description;
  }

  return MOCK_EVENT_DETAILS[event.id]?.description ?? "";
}

export function getEventLobbyAttendeeNames(event: ScheduleEvent): string[] {
  const fromDetails =
    MOCK_EVENT_DETAILS[event.id]?.attendees.map((attendee) => attendee.name) ??
    [];

  if (event.type === "meeting" && event.attendees?.length) {
    const merged = new Set([...fromDetails, ...event.attendees]);
    return [...merged];
  }

  return fromDetails;
}

export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, DATE_FORMAT).format(date);
}

export function formatEventTimeRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat(undefined, TIME_FORMAT);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function formatEventStartTime(start: Date): string {
  return new Intl.DateTimeFormat(undefined, TIME_FORMAT).format(start);
}

export function getEventLocationDisplay(event: ScheduleEvent): string {
  const location = "location" in event ? event.location : undefined;
  return location ?? DEFAULT_VENUE_ADDRESS;
}

export function getEventLocationLabel(event: ScheduleEvent): string | undefined {
  if (event.type === "talk") {
    return event.trackName;
  }

  if (
    event.type === "meeting" ||
    event.type === "workshop" ||
    event.type === "break"
  ) {
    return event.location;
  }

  return undefined;
}
