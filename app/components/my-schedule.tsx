"use client";

import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DayView,
  Scheduler,
  SchedulerDateChangeEvent,
  SchedulerHeader,
  type SchedulerHeaderProps,
} from "@progress/kendo-react-scheduler";
import ActivityPickerDialog, {
  type ActivityPickerDraft,
} from "@/app/components/activity-picker-dialog";
import ScheduleHeader from "@/app/components/schedule-header";
import ScheduleItem from "@/app/components/schedule-item";
import { createScheduleSlot } from "@/app/components/schedule-slot";
import {
  clampToConferenceRange,
  CONFERENCE_DATE_RANGE,
  getInitialScheduleDate,
} from "@/lib/schedule/conference";
import {
  createDefaultEventDraft,
  createInitialScheduleEvents,
} from "@/lib/schedule/event-data";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import { EVENT_TYPE_RESOURCE } from "@/lib/schedule/resources";
import {
  isViewingToday,
  scrollToCurrentTimeMarkerWhenReady,
} from "@/lib/schedule/scroll-to-current-time";
import type { ScheduleEvent } from "@/lib/schedule/types";

function NavigationOnlySchedulerHeader(props: SchedulerHeaderProps) {
  const navigation = Children.toArray(props.children)[0];

  return <SchedulerHeader {...props}>{navigation}</SchedulerHeader>;
}

export default function MySchedule() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState(() => getInitialScheduleDate());
  const [data, setData] = useState<ScheduleEvent[]>(() =>
    createInitialScheduleEvents(MOCK_USER_SCHEDULE)
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDraft, setPickerDraft] = useState<ActivityPickerDraft | null>(
    null
  );

  const openPicker = useCallback((draft: ActivityPickerDraft) => {
    setPickerDraft(draft);
    setPickerOpen(true);
  }, []);

  const handleNewActivity = useCallback(() => {
    const draft = createDefaultEventDraft(date);
    openPicker({
      start: draft.start as Date,
      end: draft.end as Date,
    });
  }, [date, openPicker]);

  const handleEmptySlotClick = useCallback(
    (slot: { start: Date; end: Date }) => {
      openPicker(slot);
    },
    [openPicker]
  );

  const handleClosePicker = useCallback(() => {
    setPickerOpen(false);
    setPickerDraft(null);
  }, []);

  const handleConfirmActivity = useCallback((event: ScheduleEvent) => {
    setData((current) => [...current, event]);
  }, []);

  const slotComponent = useMemo(
    () => createScheduleSlot(handleEmptySlotClick),
    [handleEmptySlotClick]
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
    <>
      <ScheduleHeader onNewActivity={handleNewActivity} />
      <div ref={scheduleRef} className="min-h-0 flex-1">
        <Scheduler
          className="my-schedule"
          style={{ height: "100%" }}
          date={date}
          data={data}
          defaultView="day"
          editable={false}
          footer={() => null}
          header={NavigationOnlySchedulerHeader}
          item={ScheduleItem}
          slot={slotComponent}
          resources={[EVENT_TYPE_RESOURCE]}
          onDateChange={handleDateChange}
        >
          <DayView
            startTime="08:00"
            endTime="20:00"
            showWorkHours={false}
            currentTimeMarker={true}
          />
        </Scheduler>
      </div>

      <ActivityPickerDialog
        open={pickerOpen}
        draft={pickerDraft}
        onClose={handleClosePicker}
        onConfirm={handleConfirmActivity}
      />
    </>
  );
}
