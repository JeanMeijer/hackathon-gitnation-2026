import type { MeetingScheduleEvent, ConferenceDateRange } from "./types";

/** Anything with a time span — real schedule events or shadow placeholders. */
type TimeBoundedEvent = { start: Date; end: Date };

/** Pool of fake handles for demo-generated meetups. */
const FAKE_NICKS = [
  "@neon_dev",
  "@pixel_pat",
  "@async_amy",
  "@hooky_sam",
  "@kernel_kate",
  "@lambda_leo",
  "@ts_tina",
  "@retro_ron",
  "@vector_vi",
  "@quanta_quinn",
  "@byte_bea",
  "@scope_sky",
];

/** Conference venue spots for demo meetups. */
const MEETUP_LOCATIONS = [
  "Near first hall",
  "Near second hall",
  "Coffee corner",
  "Sponsor lounge",
  "Registration desk",
  "Rooftop terrace",
  "Workshop room B",
  "Main stage foyer",
];

const MEETUP_MINUTES = 15;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;

interface Interval {
  start: number;
  end: number;
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickSome<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

/** Existing events on the conference day, as time intervals. */
function busyIntervalsForDay(
  events: TimeBoundedEvent[],
  day: Date,
): Interval[] {
  return events
    .filter(
      (event) =>
        event.start.getFullYear() === day.getFullYear() &&
        event.start.getMonth() === day.getMonth() &&
        event.start.getDate() === day.getDate(),
    )
    .map((event) => ({
      start: event.start.getTime(),
      end: event.end.getTime(),
    }));
}

/**
 * Generates 3–5 fake 15-minute meetups for the current user on the first
 * conference day. A meetup never overlaps an existing schedule event, and
 * never overlaps another generated meetup that shares the same interest —
 * but meetups with different interests may run in parallel.
 *
 * Demo-only: callers persist the result via addCustomScheduleEvent.
 */
export function generateMeetups(
  interests: string[],
  range: ConferenceDateRange,
  existingEvents: TimeBoundedEvent[] = [],
): MeetingScheduleEvent[] {
  const usableInterests = interests.length > 0 ? interests : ["Networking"];
  const count = 3 + Math.floor(Math.random() * 3); // 3..5
  const day = range.start;
  const busy = busyIntervalsForDay(existingEvents, day);

  // Per-interest occupancy: same interest can't double-book, different ones can.
  const placedByInterest = new Map<string, Interval[]>();
  const meetups: MeetingScheduleEvent[] = [];

  // Candidate 15-min slots across the day.
  const slots: Interval[] = [];
  for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += MEETUP_MINUTES) {
      const start = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        hour,
        minute,
      ).getTime();
      slots.push({ start, end: start + MEETUP_MINUTES * 60 * 1000 });
    }
  }

  for (let i = 0; i < count; i += 1) {
    const interest = pickRandom(usableInterests);
    const sameInterest = placedByInterest.get(interest) ?? [];

    const freeSlots = slots.filter(
      (slot) =>
        !busy.some((b) => overlaps(slot, b)) &&
        !sameInterest.some((s) => overlaps(slot, s)),
    );

    if (freeSlots.length === 0) {
      continue; // no room for this interest; skip
    }

    const slot = pickRandom(freeSlots);
    const location = pickRandom(MEETUP_LOCATIONS);

    meetups.push({
      id: crypto.randomUUID(),
      type: "meeting",
      title: `meeting for "${interest}" @ ${location}`,
      start: new Date(slot.start),
      end: new Date(slot.end),
      location,
      attendees: pickSome(FAKE_NICKS, 1 + Math.floor(Math.random() * 3)),
      generated: true,
    });

    placedByInterest.set(interest, [...sameInterest, slot]);
  }

  return meetups;
}
