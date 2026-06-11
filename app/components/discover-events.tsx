"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  DayView,
  Scheduler,
  SchedulerDateChangeEvent,
} from "@progress/kendo-react-scheduler";
import ScheduleDateNavHeader from "@/app/components/schedule-date-nav-header";
import { createScheduleItem } from "@/app/components/schedule-item";
import {
  clampToConferenceRange,
  CONFERENCE_DATE_RANGE,
  getInitialScheduleDate,
} from "@/lib/schedule/conference";
import { createInitialScheduleEvents } from "@/lib/schedule/event-data";
import { getEventTypeLabel } from "@/lib/schedule/event-lookup";
import {
  EVENT_TYPE_ORDER,
  getEventTypeThemeClass,
} from "@/lib/schedule/event-type-theme";
import { MOCK_CONFERENCE_SCHEDULE } from "@/lib/schedule/mock-conference-schedule";
import { EVENT_TYPE_RESOURCE } from "@/lib/schedule/resources";
import {
  isViewingToday,
  scrollToCurrentTimeMarkerWhenReady,
} from "@/lib/schedule/scroll-to-current-time";
import type { ScheduleEventType } from "@/lib/schedule/types";
import { useJoinedEventIds } from "@/hooks/use-joined-event-ids";

export default function DiscoverEvents() {
  const router = useRouter();
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState(getInitialScheduleDate);
  const [activeTypes, setActiveTypes] = useState<Set<ScheduleEventType>>(
    () => new Set(EVENT_TYPE_ORDER),
  );
  const joinedEventIds = useJoinedEventIds();

  const baseEvents = useMemo(
    () => createInitialScheduleEvents(MOCK_CONFERENCE_SCHEDULE),
    [],
  );

  const data = useMemo(
    () =>
      baseEvents
        .filter((event) => activeTypes.has(event.type))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [activeTypes, baseEvents],
  );

  const toggleType = useCallback((type: ScheduleEventType) => {
    setActiveTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        if (next.size === 1) {
          return current;
        }
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleEventClick = useCallback(
    (eventId: string) => {
      router.push(`/event/${eventId}`);
    },
    [router],
  );

  const itemComponent = useMemo(
    () =>
      createScheduleItem(handleEventClick, () => {}, {
        variant: "embedded",
        joinedEventIds,
      }),
    [handleEventClick, joinedEventIds],
  );

  const handleDateChange = (event: SchedulerDateChangeEvent) => {
    setDate(clampToConferenceRange(event.value, CONFERENCE_DATE_RANGE));
  };

  useEffect(() => {
    if (!isViewingToday(date)) {
      return;
    }

    const root = scheduleRef.current;
    if (!root) {
      return;
    }

    return scrollToCurrentTimeMarkerWhenReady(root);
  }, [date]);

  return (
    <div className="discover-events flex min-h-0 flex-1 flex-col">
      <div
        className="discover-events-filters flex flex-wrap gap-2 border-b border-black/10 px-4 py-3"
        role="group"
        aria-label="Filter events by category"
      >
        {EVENT_TYPE_ORDER.map((type) => {
          const selected = activeTypes.has(type);
          return (
            <button
              key={type}
              type="button"
              aria-pressed={selected}
              className={[
                "event-type-filter-pill",
                getEventTypeThemeClass(type, "event-type-filter-pill"),
                selected
                  ? "event-type-filter-pill-active"
                  : "event-type-filter-pill-inactive",
              ].join(" ")}
              onClick={() => toggleType(type)}
            >
              {getEventTypeLabel(type)}
            </button>
          );
        })}
      </div>

      <div
        ref={scheduleRef}
        className="discover-events-schedule-shell min-h-0 flex-1 overflow-hidden"
        style={{ height: "calc(100dvh - 11.5rem)", minHeight: 480 }}
      >
        <Scheduler
          className="my-schedule my-schedule-embedded discover-events-scheduler"
          style={{ height: "100%" }}
          date={date}
          data={data}
          defaultView="day"
          editable={false}
          footer={() => null}
          header={ScheduleDateNavHeader}
          item={itemComponent}
          resources={[EVENT_TYPE_RESOURCE]}
          onDateChange={handleDateChange}
        >
          <DayView
            startTime="08:00"
            endTime="20:00"
            slotDuration={60}
            slotDivisions={2}
            showWorkHours={false}
            currentTimeMarker={true}
          />
        </Scheduler>
      </div>
    </div>
  );
}
