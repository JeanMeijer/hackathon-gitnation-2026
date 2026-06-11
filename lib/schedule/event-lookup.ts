import { MOCK_EVENT_DETAILS } from "./mock-event-details";
import { MOCK_USER_SCHEDULE } from "./mock-events";
import { EVENT_TYPE_RESOURCE } from "./resources";
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
  const event = MOCK_USER_SCHEDULE.find((item) => item.id === id);
  return event ? cloneEvent(event) : undefined;
}

export function getEventTypeLabel(type: ScheduleEventType): string {
  const match = EVENT_TYPE_RESOURCE.data.find((item) => item.value === type);
  return match?.text ?? type;
}

export function getEventDescription(event: ScheduleEvent): string {
  if (event.type === "custom" && event.description) {
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
