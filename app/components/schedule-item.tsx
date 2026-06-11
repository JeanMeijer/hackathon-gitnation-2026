"use client";

import {
  SchedulerItem,
  type SchedulerItemProps,
} from "@progress/kendo-react-scheduler";
import {
  formatEventStartTime,
  getEventLocationLabel,
} from "@/lib/schedule/event-lookup";
import type { ScheduleEvent, ScheduleEventType } from "@/lib/schedule/types";

function isPastEvent(end: Date, now: number = Date.now()): boolean {
  return end.getTime() < now;
}

function isScheduleEventType(value: unknown): value is ScheduleEventType {
  return (
    value === "talk" ||
    value === "custom" ||
    value === "meeting" ||
    value === "break"
  );
}

function getScheduleEventFromDataItem(
  dataItem: SchedulerItemProps["dataItem"],
): ScheduleEvent | undefined {
  if (!dataItem || !isScheduleEventType(dataItem.type)) {
    return undefined;
  }

  return dataItem as ScheduleEvent;
}

function EmbeddedScheduleEventContent({
  event,
  start,
  title,
}: {
  event: ScheduleEvent;
  start: Date;
  title: string;
}) {
  const location = getEventLocationLabel(event);
  const time = formatEventStartTime(start);
  const meta = location ? `${location} · ${time}` : time;

  return (
    <div className="schedule-event-card">
      <div className="schedule-event-header">
        <div className="schedule-event-title">{title}</div>
        <span
          className={`schedule-event-type schedule-event-type-${event.type}`}
        >
          {event.type}
        </span>
      </div>
      <div className="schedule-event-meta">{meta}</div>
    </div>
  );
}

interface CreateScheduleItemOptions {
  variant?: "page" | "embedded";
}

export function createScheduleItem(
  onEventClick: (eventId: string) => void,
  options: CreateScheduleItemOptions = {},
) {
  const embedded = options.variant === "embedded";

  return function ScheduleItem(props: SchedulerItemProps) {
    const past = isPastEvent(props.end);
    const className = [
      props.className,
      past ? "k-event-past" : undefined,
      "schedule-event-clickable",
      embedded ? "schedule-event-embedded" : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick: SchedulerItemProps["onClick"] = (event) => {
      props.onClick?.(event);

      const eventId = props.dataItem?.id;
      if (eventId != null) {
        onEventClick(String(eventId));
      }
    };

    const scheduleEvent = getScheduleEventFromDataItem(props.dataItem);
    const title = props.title ?? scheduleEvent?.title ?? "Untitled";

    return (
      <SchedulerItem
        {...props}
        className={className}
        style={
          past
            ? {
                ...props.style,
                opacity: 0.55,
              }
            : props.style
        }
        onClick={handleClick}
      >
        {embedded && scheduleEvent ? (
          <EmbeddedScheduleEventContent
            event={scheduleEvent}
            start={props.start}
            title={title}
          />
        ) : (
          props.children
        )}
      </SchedulerItem>
    );
  };
}
