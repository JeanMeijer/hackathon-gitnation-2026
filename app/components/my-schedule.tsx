"use client";

import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
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
  clearCustomScheduleEvents,
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
import { generateMeetups } from "@/lib/schedule/generate-meetups";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import {
  defaultUserProfile,
  getProfileSnapshot,
} from "@/app/profile/profile-data";
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

export default function MySchedule() {
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

  const handleCloseRegistration = useCallback(() => {
    const profile = getProfileSnapshot(defaultUserProfile);
    const meetups = generateMeetups(
      profile.interests,
      CONFERENCE_DATE_RANGE,
      data,
    );
    meetups.forEach((meetup) => addCustomScheduleEvent(meetup));
    setDate(clampToConferenceRange(CONFERENCE_DATE_RANGE.start));
  }, [data]);

  const handleClearMeetups = useCallback(() => {
    clearCustomScheduleEvents();
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
      <ScheduleHeader onNewActivity={handleNewActivity} />
      <div
        ref={scheduleRef}
        className="min-h-0 flex-1 overflow-hidden"
        style={{ height: "calc(100dvh - 7.5rem)", minHeight: 520 }}
      >
        <Scheduler
          className="my-schedule"
          style={{ height: "100%" }}
          date={date}
          data={data}
          defaultView="day"
          editable={false}
          footer={() => null}
          header={NavigationOnlySchedulerHeader}
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

      <div className="flex justify-center gap-2 border-t border-black/10 px-4 py-2">
        <Button
          size="small"
          fillMode="flat"
          themeColor="primary"
          onClick={handleCloseRegistration}
        >
          Current conference: Close Registration
        </Button>
        <Button size="small" fillMode="flat" onClick={handleClearMeetups}>
          Clear meetups
        </Button>
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
