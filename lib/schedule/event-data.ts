import type {
  DataItem,
  SchedulerDataChangeEvent,
} from "@progress/kendo-react-scheduler";
import type { ScheduleEvent, ScheduleEventType } from "./types";

function cloneEventDates(events: ScheduleEvent[]): ScheduleEvent[] {
  return events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));
}

function isScheduleEventType(value: unknown): value is ScheduleEventType {
  return (
    value === "talk" ||
    value === "workshop" ||
    value === "meeting" ||
    value === "break"
  );
}

export function createDefaultEventDraft(viewedDate: Date): DataItem {
  const now = new Date();
  const isViewingToday =
    viewedDate.getFullYear() === now.getFullYear() &&
    viewedDate.getMonth() === now.getMonth() &&
    viewedDate.getDate() === now.getDate();

  let start: Date;
  if (isViewingToday) {
    start = new Date(now);
    const minutes = start.getMinutes();
    if (minutes < 30) {
      start.setMinutes(30, 0, 0);
    } else {
      start.setMinutes(0, 0, 0);
      start.setHours(start.getHours() + 1);
    }
  } else {
    start = new Date(
      viewedDate.getFullYear(),
      viewedDate.getMonth(),
      viewedDate.getDate(),
      9,
      0
    );
  }

  const end = new Date(start.getTime() + 30 * 60 * 1000);

  return {
    title: "",
    start,
    end,
    type: "workshop",
    isAllDay: false,
  };
}

function normalizeCreatedEvent(item: DataItem): ScheduleEvent {
  const type = isScheduleEventType(item.type) ? item.type : "workshop";
  const id = item.id != null ? String(item.id) : crypto.randomUUID();
  const title = typeof item.title === "string" ? item.title : "Untitled";
  const start = new Date(item.start);
  const end = new Date(item.end);

  switch (type) {
    case "talk":
      return {
        id,
        type,
        title,
        start,
        end,
        talkId: typeof item.talkId === "number" ? item.talkId : 0,
        trackName:
          typeof item.trackName === "string" ? item.trackName : undefined,
      };
    case "meeting":
      return {
        id,
        type,
        title,
        start,
        end,
        location: typeof item.location === "string" ? item.location : undefined,
        attendees: Array.isArray(item.attendees)
          ? item.attendees.filter(
              (name: unknown): name is string => typeof name === "string"
            )
          : undefined,
      };
    case "break":
      return {
        id,
        type,
        title,
        start,
        end,
        location: typeof item.location === "string" ? item.location : undefined,
      };
    default:
      return {
        id,
        type: "workshop",
        title,
        start,
        end,
        description:
          typeof item.description === "string" ? item.description : undefined,
        location: typeof item.location === "string" ? item.location : undefined,
      };
  }
}

function normalizeUpdatedEvent(
  existing: ScheduleEvent,
  item: DataItem
): ScheduleEvent {
  const created = normalizeCreatedEvent({ ...item, id: existing.id });
  return { ...created, id: existing.id };
}

export function applyScheduleDataChange(
  events: ScheduleEvent[],
  change: SchedulerDataChangeEvent
): ScheduleEvent[] {
  const deletedIds = new Set(change.deleted.map((item) => String(item.id)));

  const updated = events
    .filter((event) => !deletedIds.has(event.id))
    .map((event) => {
      const update = change.updated.find(
        (item) => String(item.id) === event.id
      );
      return update ? normalizeUpdatedEvent(event, update) : event;
    });

  return [...updated, ...change.created.map(normalizeCreatedEvent)];
}

export function createInitialScheduleEvents(
  events: ScheduleEvent[]
): ScheduleEvent[] {
  return cloneEventDates(events);
}
