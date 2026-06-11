import { SchedulerItem, type SchedulerItemProps } from "@progress/kendo-react-scheduler";

function isPastEvent(end: Date, now: number = Date.now()): boolean {
  return end.getTime() < now;
}

export default function ScheduleItem(props: SchedulerItemProps) {
  const past = isPastEvent(props.end);
  const className = past
    ? [props.className, "k-event-past"].filter(Boolean).join(" ")
    : props.className;

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
    />
  );
}
