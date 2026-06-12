import type { MeetingScheduleEvent } from "./types";

export type BookedMeeting = MeetingScheduleEvent & {
  bookedAt: string;
  inviteId: string;
  source: "invite";
};

export type BookMeetingInput = {
  end: Date;
  inviteId: string;
  location: string;
  name: string;
  start: Date;
};

const bookedMeetingsStorageKey = "gitnation-booked-meetings";
const bookedMeetingsEventName = "gitnation-booked-meetings-updated";

let cachedRawMeetings: string | null | undefined;
let cachedMeetings: BookedMeeting[] | undefined;

function reviveMeeting(meeting: BookedMeeting): BookedMeeting {
  return {
    ...meeting,
    start: new Date(meeting.start),
    end: new Date(meeting.end),
  };
}

function serializeMeetings(meetings: BookedMeeting[]) {
  return JSON.stringify(meetings);
}

export function getBookedMeetings() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawMeetings = window.localStorage.getItem(bookedMeetingsStorageKey);

  if (rawMeetings === cachedRawMeetings) {
    return cachedMeetings ?? [];
  }

  cachedRawMeetings = rawMeetings;

  if (!rawMeetings) {
    cachedMeetings = [];
    return [];
  }

  try {
    const parsedMeetings = JSON.parse(rawMeetings) as BookedMeeting[];
    cachedMeetings = parsedMeetings.map(reviveMeeting);
  } catch {
    cachedMeetings = [];
  }

  return cachedMeetings;
}

export function getBookedMeetingForInvite(inviteId: string) {
  return getBookedMeetings().find((meeting) => meeting.inviteId === inviteId);
}

export function saveBookedMeeting(input: BookMeetingInput) {
  const currentMeetings = getBookedMeetings();
  const meeting: BookedMeeting = {
    id: `invite-meeting-${input.inviteId}`,
    inviteId: input.inviteId,
    source: "invite",
    type: "meeting",
    title: `Meet ${input.name}`,
    location: input.location,
    attendees: [input.name],
    start: input.start,
    end: input.end,
    bookedAt: new Date().toISOString(),
  };
  const nextMeetings = [
    meeting,
    ...currentMeetings.filter(
      (currentMeeting) => currentMeeting.inviteId !== input.inviteId,
    ),
  ].sort((a, b) => a.start.getTime() - b.start.getTime());
  const serializedMeetings = serializeMeetings(nextMeetings);

  window.localStorage.setItem(bookedMeetingsStorageKey, serializedMeetings);
  cachedRawMeetings = serializedMeetings;
  cachedMeetings = nextMeetings;
  window.dispatchEvent(new Event(bookedMeetingsEventName));

  return meeting;
}

export function removeBookedMeeting(meetingId: string) {
  const nextMeetings = getBookedMeetings().filter(
    (meeting) => meeting.id !== meetingId,
  );
  const serializedMeetings = serializeMeetings(nextMeetings);

  window.localStorage.setItem(bookedMeetingsStorageKey, serializedMeetings);
  cachedRawMeetings = serializedMeetings;
  cachedMeetings = nextMeetings;
  window.dispatchEvent(new Event(bookedMeetingsEventName));

  return nextMeetings;
}

export function subscribeToBookedMeetings(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === bookedMeetingsStorageKey) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(bookedMeetingsEventName, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(bookedMeetingsEventName, callback);
  };
}
