"use client";

import { SvgIcon } from "@progress/kendo-react-common";
import {
  SchedulerItem,
  type SchedulerItemProps,
} from "@progress/kendo-react-scheduler";
import { plusIcon } from "@progress/kendo-svg-icons";
import {
  formatEventStartTime,
  getEventLocationLabel,
} from "@/lib/schedule/event-lookup";
import {
  isShadowScheduleEvent,
  SHADOW_EVENT_TITLE,
} from "@/lib/schedule/shadow-events";
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
  joined,
}: {
  event: ScheduleEvent;
  start: Date;
  title: string;
  joined?: boolean;
}) {
  const location = getEventLocationLabel(event);
  const time = formatEventStartTime(start);
  const meta = location ? `${location} · ${time}` : time;

  return (
    <div className="schedule-event-card">
      <div className="schedule-event-header">
        <div className="schedule-event-title">{title}</div>
        <span className="schedule-event-badges">
          {joined ? (
            <span className="schedule-event-joined-badge" aria-label="Joined">
              Joined
            </span>
          ) : null}
          <span
            className={`schedule-event-type schedule-event-type-${event.type}`}
          >
            {event.type}
          </span>
        </span>
      </div>
      <div className="schedule-event-meta">{meta}</div>
    </div>
  );
}

function ShadowScheduleEventContent() {
  return (
    <div className="schedule-shadow-event">
      <SvgIcon icon={plusIcon} className="schedule-shadow-event-icon" />
      <span className="schedule-shadow-event-label">add activity</span>
    </div>
  );
}

interface CreateScheduleItemOptions {
  variant?: "page" | "embedded";
  joinedEventIds?: Set<string>;
}

export function createScheduleItem(
  onEventClick: (eventId: string) => void,
  onShadowClick: (shadow: { start: Date; end: Date }) => void,
  options: CreateScheduleItemOptions = {},
) {
  const embedded = options.variant === "embedded";
  const joinedEventIds = options.joinedEventIds;

  return function ScheduleItem(props: SchedulerItemProps) {
    const shadow = isShadowScheduleEvent(props.dataItem);
    const generated = props.dataItem?.generated === true;
    const past = !shadow && isPastEvent(props.end);
    const eventId =
      props.dataItem?.id != null ? String(props.dataItem.id) : undefined;
    const joined = Boolean(eventId && joinedEventIds?.has(eventId));
    const className = [
      props.className,
      shadow ? "schedule-event-shadow" : undefined,
      past ? "k-event-past" : undefined,
      shadow
        ? "schedule-shadow-clickable"
        : generated
          ? undefined
          : "schedule-event-clickable",
      embedded && !shadow ? "schedule-event-embedded" : undefined,
      joined ? "schedule-event-joined" : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick: SchedulerItemProps["onClick"] = (event) => {
      if (generated) {
        return;
      }

      props.onClick?.(event);

      if (shadow) {
        onShadowClick({ start: props.start, end: props.end });
        return;
      }

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
        title={shadow ? SHADOW_EVENT_TITLE : props.title}
        className={className}
        style={{
          ...props.style,
          ...(past ? { opacity: 0.55 } : null),
          ...(generated ? { cursor: "default" } : null),
        }}
        onClick={handleClick}
      >
        {shadow ? (
          <ShadowScheduleEventContent />
        ) : embedded && scheduleEvent ? (
          <EmbeddedScheduleEventContent
            event={scheduleEvent}
            start={props.start}
            title={title}
            joined={joined}
          />
        ) : (
          props.children
        )}
      </SchedulerItem>
    );
  };
}
