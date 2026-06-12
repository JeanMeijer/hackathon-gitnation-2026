import type { ScheduleEventType } from "./types";

export const EVENT_TYPE_THEME: Record<
  ScheduleEventType,
  { label: string; color: string }
> = {
  talk: { label: "Talk", color: "#1274AC" },
  meeting: { label: "Meeting", color: "#3A9B23" },
  break: { label: "Break", color: "#656565" },
  workshop: { label: "Workshop", color: "#7630BC" },
};

export const EVENT_TYPE_ORDER: ScheduleEventType[] = [
  "talk",
  "meeting",
  "break",
  "workshop",
];

export function getEventTypeColor(type: ScheduleEventType): string {
  return EVENT_TYPE_THEME[type].color;
}

export function getEventTypeThemeClass(
  type: ScheduleEventType,
  prefix: string,
): string {
  return `${prefix}-${type}`;
}
