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
import { Button } from "@progress/kendo-react-buttons";
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
  getRemovedScheduleEventIds,
  subscribeToRemovedScheduleEvents,
} from "@/lib/schedule/removed-schedule-events";
import {
  isViewingToday,
  scrollToCurrentTimeMarkerWhenReady,
} from "@/lib/schedule/scroll-to-current-time";
import { computeShadowEvents } from "@/lib/schedule/shadow-events";
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
  const removedEventIds = useSyncExternalStore(
    subscribeToRemovedScheduleEvents,
    getRemovedScheduleEventIds,
    () => new Set<string>(),
  );
  const baseEvents = useMemo(
    () =>
      createInitialScheduleEvents(
        MOCK_USER_SCHEDULE.filter((event) => !removedEventIds.has(event.id)),
      ),
    [removedEventIds],
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

  // Dev-only control: hidden everywhere but localhost. Computed after mount so
  // the server-rendered markup (no `window`) matches the first client render.
  const [isLocalhost, setIsLocalhost] = useState(false);
  useEffect(() => {
    const { hostname } = window.location;
    setIsLocalhost(hostname === "localhost" || hostname === "127.0.0.1");
  }, []);

  const realEvents = useMemo(
    () =>
      [...baseEvents, ...bookedMeetings, ...customEvents].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      ),
    [baseEvents, bookedMeetings, customEvents]
  );

  const shadowEvents = useMemo(
    () => computeShadowEvents(realEvents, date),
    [realEvents, date]
  );

  const data = useMemo(
    () => [...realEvents, ...shadowEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    ),
    [realEvents, shadowEvents]
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

  const handleShadowClick = useCallback(
    (shadow: { start: Date; end: Date }) => {
      openPicker({
        start: new Date(shadow.start),
        end: new Date(shadow.end),
        shadowWindow: {
          start: new Date(shadow.start),
          end: new Date(shadow.end),
        },
      });
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
    () => createScheduleItem(handleEventClick, handleShadowClick, { variant }),
    [handleEventClick, handleShadowClick, variant],
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
            ? "my-schedule-embed flex min-h-0 flex-1 flex-col overflow-hidden"
            : "min-h-0 flex-1 overflow-hidden"
        }
        style={embedded ? undefined : { height: "calc(100dvh - 7.5rem)", minHeight: 520 }}
      >
        <Scheduler
          className={embedded ? "my-schedule my-schedule-embedded" : "my-schedule"}
          style={{ height: "100%" }}
          date={date}
          data={data}
          defaultView="day"
          editable={false}
          footer={ScheduleDateNavHeader}
          header={() => null}
          item={itemComponent}
          resources={[EVENT_TYPE_RESOURCE]}
          onDateChange={handleDateChange}
        >
          <DayView
            startTime="08:00"
            endTime="20:00"
            slotDuration={60}
            slotDivisions={2}
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
        {isLocalhost ? (
          <Button size="small" fillMode="flat" onClick={handleClearMeetups}>
            Clear meetups
          </Button>
        ) : null}
      </div>

      <ActivityPickerDialog
        open={pickerOpen}
        draft={pickerDraft}
        existingEvents={realEvents}
        onClose={handleClosePicker}
        onConfirm={handleConfirmActivity}
      />
    </>
  );
}
