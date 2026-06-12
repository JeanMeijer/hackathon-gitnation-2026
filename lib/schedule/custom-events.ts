import type { ScheduleEvent } from "./types";

const customEventsStorageKey = "gitnation-custom-schedule-events";
const customEventsEventName = "gitnation-custom-schedule-events-updated";
const emptyCustomEvents: ScheduleEvent[] = [];

let cachedRawEvents: string | null | undefined;
let cachedEvents: ScheduleEvent[] | undefined;

function reviveEvent(event: ScheduleEvent): ScheduleEvent {
  return {
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  };
}

function isValidEvent(event: ScheduleEvent) {
  return (
    event.start instanceof Date &&
    event.end instanceof Date &&
    !Number.isNaN(event.start.getTime()) &&
    !Number.isNaN(event.end.getTime()) &&
    event.end.getTime() > event.start.getTime()
  );
}

function writeEvents(events: ScheduleEvent[]) {
  const nextEvents = events
    .map(reviveEvent)
    .filter(isValidEvent)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const serializedEvents = JSON.stringify(nextEvents);

  window.localStorage.setItem(customEventsStorageKey, serializedEvents);
  cachedRawEvents = serializedEvents;
  cachedEvents = nextEvents;
  window.dispatchEvent(new Event(customEventsEventName));

  return nextEvents;
}

export function getCustomScheduleEvents() {
  if (typeof window === "undefined") {
    return emptyCustomEvents;
  }

  const rawEvents = window.localStorage.getItem(customEventsStorageKey);

  if (rawEvents === cachedRawEvents) {
    return cachedEvents ?? emptyCustomEvents;
  }

  cachedRawEvents = rawEvents;

  if (!rawEvents) {
    cachedEvents = emptyCustomEvents;
    return cachedEvents;
  }

  try {
    const parsedEvents = JSON.parse(rawEvents) as ScheduleEvent[];
    cachedEvents = parsedEvents.map(reviveEvent).filter(isValidEvent);
  } catch {
    cachedEvents = emptyCustomEvents;
  }

  return cachedEvents;
}

export function addCustomScheduleEvent(event: ScheduleEvent) {
  const existing = getCustomScheduleEvents();
  if (existing.some((item) => item.id === event.id)) {
    return existing;
  }

  return writeEvents([...existing, event]);
}

export function removeCustomScheduleEvent(eventId: string) {
  return writeEvents(
    getCustomScheduleEvents().filter((event) => event.id !== eventId),
  );
}

export function isScheduleEventJoined(eventId: string) {
  return getCustomScheduleEvents().some((event) => event.id === eventId);
}

export function subscribeToCustomScheduleEvents(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === customEventsStorageKey) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(customEventsEventName, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(customEventsEventName, callback);
  };
}
