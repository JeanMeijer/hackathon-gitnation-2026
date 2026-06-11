import type { SchedulerResource } from "@progress/kendo-react-scheduler";

export const EVENT_TYPE_RESOURCE: SchedulerResource = {
  name: "EventType",
  field: "type",
  valueField: "value",
  textField: "text",
  colorField: "color",
  data: [
    { value: "talk", text: "Talk", color: "#1274AC" },
    { value: "meeting", text: "Meeting", color: "#3A9B23" },
    { value: "break", text: "Break", color: "#656565" },
    { value: "custom", text: "Custom", color: "#7630BC" },
  ],
};
