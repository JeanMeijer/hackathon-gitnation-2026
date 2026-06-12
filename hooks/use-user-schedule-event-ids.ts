"use client";

import { useSyncExternalStore } from "react";
import { getBookedMeetings } from "@/lib/schedule/booked-meetings";
import { getCustomScheduleEvents } from "@/lib/schedule/custom-events";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import { getRemovedScheduleEventIds } from "@/lib/schedule/removed-schedule-events";
import { subscribeToUserScheduleMembership } from "@/lib/schedule/user-schedule-membership";

const emptyScheduleIds = new Set<string>();

let cachedScheduleIdsKey = "";
let cachedScheduleIds: Set<string> = emptyScheduleIds;

function getUserScheduleEventIdsSnapshot(): Set<string> {
  const removedIds = getRemovedScheduleEventIds();
  const ids = [
    ...MOCK_USER_SCHEDULE.filter((event) => !removedIds.has(event.id)).map(
      (event) => event.id,
    ),
    ...getCustomScheduleEvents().map((event) => event.id),
    ...getBookedMeetings().map((meeting) => meeting.id),
  ]
    .sort()
    .join("\0");

  if (ids === cachedScheduleIdsKey) {
    return cachedScheduleIds;
  }

  cachedScheduleIdsKey = ids;
  cachedScheduleIds = ids ? new Set(ids.split("\0")) : emptyScheduleIds;
  return cachedScheduleIds;
}

export function useUserScheduleEventIds(): Set<string> {
  return useSyncExternalStore(
    subscribeToUserScheduleMembership,
    getUserScheduleEventIdsSnapshot,
    () => emptyScheduleIds,
  );
}
