import type { SchedulerResource } from "@progress/kendo-react-scheduler";
import { EVENT_TYPE_ORDER, EVENT_TYPE_THEME } from "./event-type-theme";

export const EVENT_TYPE_RESOURCE: SchedulerResource = {
  name: "EventType",
  field: "type",
  valueField: "value",
  textField: "text",
  colorField: "color",
  data: EVENT_TYPE_ORDER.map((type) => ({
    value: type,
    text: EVENT_TYPE_THEME[type].label,
    color: EVENT_TYPE_THEME[type].color,
  })),
};
