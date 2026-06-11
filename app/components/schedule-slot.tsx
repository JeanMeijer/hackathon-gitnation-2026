"use client";

import {
  SchedulerSlot,
  type SchedulerSlotProps,
} from "@progress/kendo-react-scheduler";

export function createScheduleSlot(
  onEmptySlotClick: (slot: { start: Date; end: Date }) => void
) {
  return function ScheduleSlot(props: SchedulerSlotProps) {
    const handleClick: SchedulerSlotProps["onClick"] = (event) => {
      props.onClick?.(event);
      if (props.items.length === 0) {
        onEmptySlotClick({ start: props.start, end: props.end });
      }
    };

    const className = [
      props.className,
      props.items.length === 0 ? "schedule-slot-empty" : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return <SchedulerSlot {...props} className={className} onClick={handleClick} />;
  };
}
