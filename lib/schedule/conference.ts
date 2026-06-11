import type { ConferenceDateRange } from "./types";

/** Admin-defined conference window (mock until loaded from backend). */
export const CONFERENCE_DATE_RANGE: ConferenceDateRange = {
  start: new Date(2026, 5, 11),
  end: new Date(2026, 5, 13),
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function clampToConferenceRange(
  date: Date,
  range: ConferenceDateRange = CONFERENCE_DATE_RANGE,
): Date {
  const day = startOfDay(date).getTime();
  const start = startOfDay(range.start).getTime();
  const end = startOfDay(range.end).getTime();

  if (day < start) return new Date(start);
  if (day > end) return new Date(end);
  return startOfDay(date);
}

/** Opens on today when in range; otherwise snaps to the nearest day in range. */
export function getInitialScheduleDate(
  now: Date = new Date(),
  range: ConferenceDateRange = CONFERENCE_DATE_RANGE,
): Date {
  const today = startOfDay(now).getTime();
  const start = startOfDay(range.start).getTime();
  const end = startOfDay(range.end).getTime();

  if (today < start) return new Date(start);
  if (today > end) return new Date(end);
  return startOfDay(now);
}
