"use client";

import { useMemo, useState } from "react";
import {
  DayView,
  Scheduler,
  SchedulerDateChangeEvent,
} from "@progress/kendo-react-scheduler";
import {
  clampToConferenceRange,
  CONFERENCE_DATE_RANGE,
  getInitialScheduleDate,
} from "@/lib/schedule/conference";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import { EVENT_TYPE_RESOURCE } from "@/lib/schedule/resources";

export default function MySchedule() {
  const [date, setDate] = useState(() => getInitialScheduleDate());

  const data = useMemo(
    () =>
      MOCK_USER_SCHEDULE.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })),
    [],
  );

  const handleDateChange = (event: SchedulerDateChangeEvent) => {
    setDate(clampToConferenceRange(event.value, CONFERENCE_DATE_RANGE));
  };

  return (
    <Scheduler
      className="my-schedule"
      style={{ height: "100%" }}
      date={date}
      data={data}
      defaultView="day"
      editable={false}
      resources={[EVENT_TYPE_RESOURCE]}
      onDateChange={handleDateChange}
    >
      <DayView
        startTime="08:00"
        endTime="20:00"
        currentTimeMarker={true}
      />
    </Scheduler>
  );
}
