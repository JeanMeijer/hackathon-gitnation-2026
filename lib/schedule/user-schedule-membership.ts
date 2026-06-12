import {
  getBookedMeetings,
  removeBookedMeeting,
  subscribeToBookedMeetings,
} from "@/lib/schedule/booked-meetings";
import {
  getCustomScheduleEvents,
  removeCustomScheduleEvent,
  subscribeToCustomScheduleEvents,
} from "@/lib/schedule/custom-events";
import { getScheduleEventById } from "@/lib/schedule/event-lookup";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import {
  addRemovedScheduleEventId,
  getRemovedScheduleEventIds,
  subscribeToRemovedScheduleEvents,
} from "@/lib/schedule/removed-schedule-events";

export function isEventOnUserSchedule(eventId: string): boolean {
  if (getRemovedScheduleEventIds().has(eventId)) {
    return false;
  }

  if (MOCK_USER_SCHEDULE.some((event) => event.id === eventId)) {
    return true;
  }

  if (getCustomScheduleEvents().some((event) => event.id === eventId)) {
    return true;
  }

  return getBookedMeetings().some((meeting) => meeting.id === eventId);
}

export function removeEventFromUserSchedule(eventId: string) {
  if (getCustomScheduleEvents().some((event) => event.id === eventId)) {
    removeCustomScheduleEvent(eventId);
    return;
  }

  if (getBookedMeetings().some((meeting) => meeting.id === eventId)) {
    removeBookedMeeting(eventId);
    return;
  }

  if (MOCK_USER_SCHEDULE.some((event) => event.id === eventId)) {
    addRemovedScheduleEventId(eventId);
  }
}

export function subscribeToUserScheduleMembership(callback: () => void) {
  const unsubscribeCustom = subscribeToCustomScheduleEvents(callback);
  const unsubscribeBooked = subscribeToBookedMeetings(callback);
  const unsubscribeRemoved = subscribeToRemovedScheduleEvents(callback);

  return () => {
    unsubscribeCustom();
    unsubscribeBooked();
    unsubscribeRemoved();
  };
}

export function resolveScheduleEvent(eventId: string) {
  return getScheduleEventById(eventId);
}
