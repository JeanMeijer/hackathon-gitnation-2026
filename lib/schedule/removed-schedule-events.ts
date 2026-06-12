const removedEventsStorageKey = "gitnation-removed-schedule-events";
const removedEventsEventName = "gitnation-removed-schedule-events-updated";
const emptyRemovedIds = new Set<string>();

let cachedRawRemovedIds: string | null | undefined;
let cachedRemovedIds: Set<string> | undefined;

function writeRemovedIds(ids: Set<string>) {
  const serializedIds = JSON.stringify([...ids].sort());
  window.localStorage.setItem(removedEventsStorageKey, serializedIds);
  cachedRawRemovedIds = serializedIds;
  cachedRemovedIds = ids;
  window.dispatchEvent(new Event(removedEventsEventName));
}

export function getRemovedScheduleEventIds(): Set<string> {
  if (typeof window === "undefined") {
    return emptyRemovedIds;
  }

  const rawIds = window.localStorage.getItem(removedEventsStorageKey);

  if (rawIds === cachedRawRemovedIds) {
    return cachedRemovedIds ?? emptyRemovedIds;
  }

  cachedRawRemovedIds = rawIds;

  if (!rawIds) {
    cachedRemovedIds = emptyRemovedIds;
    return cachedRemovedIds;
  }

  try {
    const parsedIds = JSON.parse(rawIds) as string[];
    cachedRemovedIds = new Set(parsedIds);
  } catch {
    cachedRemovedIds = emptyRemovedIds;
  }

  return cachedRemovedIds;
}

export function addRemovedScheduleEventId(eventId: string) {
  const nextIds = new Set(getRemovedScheduleEventIds());
  nextIds.add(eventId);
  writeRemovedIds(nextIds);
}

export function subscribeToRemovedScheduleEvents(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === removedEventsStorageKey) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(removedEventsEventName, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(removedEventsEventName, callback);
  };
}
