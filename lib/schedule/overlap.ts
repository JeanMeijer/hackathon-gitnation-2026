import { formatEventStartTime } from "./event-lookup";
import type { ScheduleEvent } from "./types";

export function eventsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return (
    startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime()
  );
}

export function getOverlappingEvents(
  events: ScheduleEvent[],
  start: Date,
  end: Date,
): ScheduleEvent[] {
  return events.filter((event) =>
    eventsOverlap(start, end, event.start, event.end),
  );
}

export function formatOverlapWarning(
  overlaps: ScheduleEvent[],
): string | null {
  if (overlaps.length === 0) {
    return null;
  }

  const first = overlaps[0];
  return `Overlaps with ${first.title} at ${formatEventStartTime(first.start)}`;
}
