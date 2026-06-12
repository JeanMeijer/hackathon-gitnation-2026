import { isViewingToday } from "./scroll-to-current-time";
import type { ScheduleEvent } from "./types";

export const SHADOW_EVENT_TITLE = "Add activity";
export const MIN_SHADOW_GAP_MS = 60 * 60 * 1000;
/** Matches DayView slotDuration (60) / slotDivisions (2). */
export const SHADOW_SLOT_MINUTES = 30;
const DAY_VIEW_START_HOUR = 8;
const DAY_VIEW_END_HOUR = 20;

export interface ShadowScheduleEvent {
  id: string;
  type: "shadow";
  title: typeof SHADOW_EVENT_TITLE;
  start: Date;
  end: Date;
}

export function isShadowScheduleEvent(
  value: unknown,
): value is ShadowScheduleEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "shadow"
  );
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDayViewBounds(viewedDate: Date) {
  return {
    dayStart: new Date(
      viewedDate.getFullYear(),
      viewedDate.getMonth(),
      viewedDate.getDate(),
      DAY_VIEW_START_HOUR,
      0,
      0,
      0,
    ),
    dayEnd: new Date(
      viewedDate.getFullYear(),
      viewedDate.getMonth(),
      viewedDate.getDate(),
      DAY_VIEW_END_HOUR,
      0,
      0,
      0,
    ),
  };
}

function eventIntersectsDay(
  event: ScheduleEvent,
  dayStart: Date,
  dayEnd: Date,
): boolean {
  return event.start.getTime() < dayEnd.getTime() && event.end.getTime() > dayStart.getTime();
}

function createShadowEvent(start: Date, end: Date): ShadowScheduleEvent {
  return {
    id: `shadow-${start.getTime()}-${end.getTime()}`,
    type: "shadow",
    title: SHADOW_EVENT_TITLE,
    start: new Date(start),
    end: new Date(end),
  };
}

function alignToDayGrid(
  date: Date,
  dayStart: Date,
  mode: "floor" | "ceil",
): Date {
  const slotMs = SHADOW_SLOT_MINUTES * 60 * 1000;
  const offsetMs = date.getTime() - dayStart.getTime();
  const alignedOffsetMs =
    mode === "floor"
      ? Math.floor(offsetMs / slotMs) * slotMs
      : Math.ceil(offsetMs / slotMs) * slotMs;

  return new Date(dayStart.getTime() + alignedOffsetMs);
}

function shadowOverlapsEvent(
  shadow: ShadowScheduleEvent,
  event: ScheduleEvent,
): boolean {
  return (
    shadow.start.getTime() < event.end.getTime() &&
    shadow.end.getTime() > event.start.getTime()
  );
}

function withoutOverlappingEvents(
  shadows: ShadowScheduleEvent[],
  events: ScheduleEvent[],
): ShadowScheduleEvent[] {
  return shadows.filter(
    (shadow) => !events.some((event) => shadowOverlapsEvent(shadow, event)),
  );
}

export function computeShadowEvents(
  events: ScheduleEvent[],
  viewedDate: Date,
  now: Date = new Date(),
): ShadowScheduleEvent[] {
  const { dayStart, dayEnd } = getDayViewBounds(viewedDate);
  const viewingToday = isViewingToday(viewedDate, now);

  let scanStart = dayStart;
  if (viewingToday) {
    if (now.getTime() >= dayEnd.getTime()) {
      return [];
    }
    if (now.getTime() > dayStart.getTime()) {
      scanStart = alignToDayGrid(new Date(now), dayStart, "ceil");
    }
  }

  if (scanStart.getTime() >= dayEnd.getTime()) {
    return [];
  }

  const dayEvents = events
    .filter((event) => eventIntersectsDay(event, dayStart, dayEnd))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const shadows: ShadowScheduleEvent[] = [];
  let cursor = scanStart;

  for (const event of dayEvents) {
    if (event.end.getTime() <= cursor.getTime()) {
      continue;
    }

    if (event.start.getTime() > cursor.getTime()) {
      const gapEnd = alignToDayGrid(event.start, dayStart, "floor");
      const gapMs = gapEnd.getTime() - cursor.getTime();
      if (gapMs >= MIN_SHADOW_GAP_MS) {
        shadows.push(createShadowEvent(cursor, gapEnd));
      }
    }

    if (event.end.getTime() > cursor.getTime()) {
      cursor = alignToDayGrid(event.end, dayStart, "ceil");
    }
  }

  const remainingMs = dayEnd.getTime() - cursor.getTime();
  if (remainingMs >= MIN_SHADOW_GAP_MS) {
    shadows.push(createShadowEvent(cursor, dayEnd));
  }

  return withoutOverlappingEvents(shadows, dayEvents);
}

export function isStartWithinShadowWindow(
  start: Date,
  window: { start: Date; end: Date },
): boolean {
  return (
    start.getTime() >= window.start.getTime() &&
    start.getTime() <= window.end.getTime()
  );
}

export function filterEventsOnDay(
  events: ScheduleEvent[],
  day: Date,
): ScheduleEvent[] {
  return events.filter((event) => sameCalendarDay(event.start, day));
}
