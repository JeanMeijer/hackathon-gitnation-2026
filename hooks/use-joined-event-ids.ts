"use client";

import { useSyncExternalStore } from "react";
import {
  getCustomScheduleEvents,
  subscribeToCustomScheduleEvents,
} from "@/lib/schedule/custom-events";

const emptyJoinedIds = new Set<string>();

let cachedJoinedIdsKey = "";
let cachedJoinedIds: Set<string> = emptyJoinedIds;

function getJoinedEventIdsSnapshot(): Set<string> {
  const ids = getCustomScheduleEvents()
    .map((event) => event.id)
    .sort()
    .join("\0");

  if (ids === cachedJoinedIdsKey) {
    return cachedJoinedIds;
  }

  cachedJoinedIdsKey = ids;
  cachedJoinedIds = ids ? new Set(ids.split("\0")) : emptyJoinedIds;
  return cachedJoinedIds;
}

export function useJoinedEventIds(): Set<string> {
  return useSyncExternalStore(
    subscribeToCustomScheduleEvents,
    getJoinedEventIdsSnapshot,
    () => emptyJoinedIds,
  );
}
