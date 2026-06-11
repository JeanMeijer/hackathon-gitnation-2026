"use client";

import {
  SchedulerItem,
  type SchedulerItemProps,
} from "@progress/kendo-react-scheduler";

function isPastEvent(end: Date, now: number = Date.now()): boolean {
  return end.getTime() < now;
}

export function createScheduleItem(onEventClick: (eventId: string) => void) {
  return function ScheduleItem(props: SchedulerItemProps) {
    const past = isPastEvent(props.end);
    const generated = props.dataItem?.generated === true;
    const className = [
      props.className,
      past ? "k-event-past" : undefined,
      generated ? undefined : "schedule-event-clickable",
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick: SchedulerItemProps["onClick"] = (event) => {
      if (generated) {
        return;
      }

      props.onClick?.(event);

      const eventId = props.dataItem?.id;
      if (eventId != null) {
        onEventClick(String(eventId));
      }
    };

    return (
      <SchedulerItem
        {...props}
        className={className}
        style={{
          ...props.style,
          ...(past ? { opacity: 0.55 } : null),
          ...(generated ? { cursor: "default" } : null),
        }}
        onClick={handleClick}
      />
    );
  };
}
