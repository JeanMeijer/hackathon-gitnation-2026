"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  DayView,
  Scheduler,
  SchedulerDateChangeEvent,
} from "@progress/kendo-react-scheduler";
import ActivityPickerDialog, {
  type ActivityPickerDraft,
} from "@/app/components/activity-picker-dialog";
import ScheduleDateNavHeader from "@/app/components/schedule-date-nav-header";
import ScheduleHeader from "@/app/components/schedule-header";
import { createScheduleItem } from "@/app/components/schedule-item";
import { createScheduleSlot } from "@/app/components/schedule-slot";
import {
  clampToConferenceRange,
  CONFERENCE_DATE_RANGE,
  getInitialScheduleDate,
  parseScheduleDateParam,
} from "@/lib/schedule/conference";
import {
  addCustomScheduleEvent,
  getCustomScheduleEvents,
  subscribeToCustomScheduleEvents,
} from "@/lib/schedule/custom-events";
import {
  createDefaultEventDraft,
  createInitialScheduleEvents,
} from "@/lib/schedule/event-data";
import {
  getBookedMeetings,
  subscribeToBookedMeetings,
  type BookedMeeting,
} from "@/lib/schedule/booked-meetings";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import { EVENT_TYPE_RESOURCE } from "@/lib/schedule/resources";
import {
  isViewingToday,
  scrollToCurrentTimeMarkerWhenReady,
} from "@/lib/schedule/scroll-to-current-time";
import type { ScheduleEvent } from "@/lib/schedule/types";

const emptyBookedMeetings: BookedMeeting[] = [];
const emptyCustomEvents: ScheduleEvent[] = [];

function getInitialDateFromQuery() {
  if (typeof window === "undefined") {
    return getInitialScheduleDate();
  }

  const requestedDate = parseScheduleDateParam(
    new URLSearchParams(window.location.search).get("date")
  );

  return requestedDate
    ? clampToConferenceRange(requestedDate, CONFERENCE_DATE_RANGE)
    : getInitialScheduleDate();
}

interface MyScheduleProps {
  variant?: "page" | "embedded";
}

export default function MySchedule({ variant = "page" }: MyScheduleProps) {
  const embedded = variant === "embedded";
  const router = useRouter();
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState(() => getInitialDateFromQuery());
  const baseEvents = useMemo(
    () => createInitialScheduleEvents(MOCK_USER_SCHEDULE),
    []
  );
  const bookedMeetings = useSyncExternalStore(
    subscribeToBookedMeetings,
    getBookedMeetings,
    () => emptyBookedMeetings
  );
  const customEvents = useSyncExternalStore(
    subscribeToCustomScheduleEvents,
    getCustomScheduleEvents,
    () => emptyCustomEvents
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDraft, setPickerDraft] = useState<ActivityPickerDraft | null>(
    null
  );
  const data = useMemo(
    () =>
      [...baseEvents, ...bookedMeetings, ...customEvents].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      ),
    [baseEvents, bookedMeetings, customEvents]
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
    addCustomScheduleEvent(event);
  }, []);

  const handleEventClick = useCallback(
    (eventId: string) => {
      router.push(`/event/${eventId}`);
    },
    [router],
  );

  const itemComponent = useMemo(
    () => createScheduleItem(handleEventClick),
    [handleEventClick],
  );

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
      {!embedded ? <ScheduleHeader onNewActivity={handleNewActivity} /> : null}
      <div
        ref={scheduleRef}
        className={
          embedded
            ? "my-schedule-embed overflow-hidden"
            : "min-h-0 flex-1 overflow-hidden"
        }
        style={
          embedded
            ? { height: 520 }
            : { height: "calc(100dvh - 7.5rem)", minHeight: 520 }
        }
      >
        <Scheduler
          className={embedded ? "my-schedule my-schedule-embedded" : "my-schedule"}
          style={{ height: "100%" }}
          date={date}
          data={data}
          defaultView="day"
          editable={false}
          footer={() => null}
          header={ScheduleDateNavHeader}
          item={itemComponent}
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
