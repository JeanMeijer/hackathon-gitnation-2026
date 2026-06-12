"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Card, CardBody, CardTitle } from "@progress/kendo-react-layout";
import {
  DayView,
  Scheduler,
  SchedulerDateChangeEvent,
} from "@progress/kendo-react-scheduler";
import { checkIcon, chevronRightIcon } from "@progress/kendo-svg-icons";
import ScheduleDateNavHeader from "@/app/components/schedule-date-nav-header";
import { createScheduleItem } from "@/app/components/schedule-item";
import {
  addCustomScheduleEvent,
  removeCustomScheduleEvent,
} from "@/lib/schedule/custom-events";
import {
  clampToConferenceRange,
  CONFERENCE_DATE_RANGE,
  getInitialScheduleDate,
} from "@/lib/schedule/conference";
import { createInitialScheduleEvents } from "@/lib/schedule/event-data";
import {
  formatEventDate,
  formatEventTimeRange,
  getEventLocationDisplay,
  getEventTypeLabel,
} from "@/lib/schedule/event-lookup";
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
import type { ScheduleEvent, ScheduleEventType } from "@/lib/schedule/types";
import { useJoinedEventIds } from "@/hooks/use-joined-event-ids";
import styles from "./discover-events.module.css";

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

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

  const visibleEvents = useMemo(
    () => data.filter((event) => isSameDay(event.start, date)),
    [data, date],
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

  const handleToggleJoin = useCallback(
    (event: ScheduleEvent) => {
      if (joinedEventIds.has(event.id)) {
        removeCustomScheduleEvent(event.id);
        return;
      }

      addCustomScheduleEvent(event);
    },
    [joinedEventIds],
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
    <div className="discover-events flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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

      <div className={styles.content}>
        <div
          ref={scheduleRef}
          className="discover-events-schedule-shell min-h-0 flex-1 overflow-hidden"
        >
          <Scheduler
            className="my-schedule my-schedule-embedded discover-events-scheduler"
            style={{ height: "100%" }}
            date={date}
            data={data}
            defaultView="day"
            editable={false}
            footer={ScheduleDateNavHeader}
            header={() => null}
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

        <aside
          className={styles.cardsPanel}
          aria-labelledby="discover-event-cards"
        >
          <div className={styles.cardsHeader}>
            <div>
              <h2 id="discover-event-cards" className={styles.cardsTitle}>
                Event cards
              </h2>
              <p className={styles.cardsSubtitle}>{formatEventDate(date)}</p>
            </div>
            <span className={styles.eventCount} aria-label="Visible events">
              {visibleEvents.length}
            </span>
          </div>

          {visibleEvents.length ? (
            <ul className={styles.eventList}>
              {visibleEvents.map((event) => {
                const joined = joinedEventIds.has(event.id);

                return (
                  <li key={event.id}>
                    <Card className={styles.eventCard} orientation="vertical">
                      <CardBody className={styles.eventCardBody}>
                        <div className={styles.eventCardTopline}>
                          <span
                            className={[
                              "event-type-label-pill",
                              getEventTypeThemeClass(
                                event.type,
                                "event-type-label-pill",
                              ),
                            ].join(" ")}
                          >
                            {getEventTypeLabel(event.type)}
                          </span>
                          {joined ? (
                            <span className={styles.joinedLabel}>Joined</span>
                          ) : null}
                        </div>

                        <div className={styles.eventCardText}>
                          <CardTitle className={styles.eventCardTitle}>
                            {event.title}
                          </CardTitle>
                          <p className={styles.eventCardMeta}>
                            {formatEventTimeRange(event.start, event.end)}
                          </p>
                          <p className={styles.eventCardLocation}>
                            {getEventLocationDisplay(event)}
                          </p>
                        </div>

                        <div className={styles.eventCardActions}>
                          <Button
                            fillMode={joined ? "outline" : "solid"}
                            themeColor={joined ? "base" : "primary"}
                            svgIcon={joined ? checkIcon : undefined}
                            onClick={() => handleToggleJoin(event)}
                            aria-label={
                              joined
                                ? `Remove ${event.title} from schedule`
                                : `Add ${event.title} to schedule`
                            }
                          >
                            {joined ? "In schedule" : "Join"}
                          </Button>
                          <Button
                            fillMode="flat"
                            themeColor="primary"
                            svgIcon={chevronRightIcon}
                            onClick={() => handleEventClick(event.id)}
                            aria-label={`View details for ${event.title}`}
                          >
                            Details
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.emptyState} role="status">
              No events match these filters for this day.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
