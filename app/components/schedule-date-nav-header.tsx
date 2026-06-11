"use client";

import { useCallback, useMemo, type MouseEvent } from "react";
import { addDays } from "@progress/kendo-date-math";
import {
  Button,
  ButtonGroup,
} from "@progress/kendo-react-buttons";
import {
  SchedulerFooter,
  useSchedulerDateContext,
  type SchedulerFooterProps,
} from "@progress/kendo-react-scheduler";
import { chevronLeftIcon, chevronRightIcon } from "@progress/kendo-svg-icons";
import {
  clampToConferenceRange,
  CONFERENCE_DATE_RANGE,
  getInitialScheduleDate,
} from "@/lib/schedule/conference";
import { isViewingToday } from "@/lib/schedule/scroll-to-current-time";

const navDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "numeric",
  day: "numeric",
});

function formatNavDate(date: Date): string {
  return navDateFormatter.format(date);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function ScheduleDateNavHeader(props: SchedulerFooterProps) {
  const [date, setDate] = useSchedulerDateContext();
  const viewingToday = isViewingToday(date);

  const { atRangeStart, atRangeEnd } = useMemo(() => {
    const start = CONFERENCE_DATE_RANGE.start;
    const end = CONFERENCE_DATE_RANGE.end;

    return {
      atRangeStart: isSameDay(date, start),
      atRangeEnd: isSameDay(date, end),
    };
  }, [date]);

  const label = viewingToday ? "today" : formatNavDate(date);

  const goPrevious = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (atRangeStart) {
        return;
      }

      setDate(
        clampToConferenceRange(addDays(date, -1), CONFERENCE_DATE_RANGE),
        event,
      );
    },
    [atRangeStart, date, setDate],
  );

  const goNext = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (atRangeEnd) {
        return;
      }

      setDate(
        clampToConferenceRange(addDays(date, 1), CONFERENCE_DATE_RANGE),
        event,
      );
    },
    [atRangeEnd, date, setDate],
  );

  const goToday = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setDate(getInitialScheduleDate(), event);
    },
    [setDate],
  );

  return (
    <SchedulerFooter {...props}>
      <div className="schedule-date-nav">
        <ButtonGroup className="k-scheduler-navigation schedule-date-nav-group">
          <Button
            role="button"
            tabIndex={-1}
            title="Previous day"
            aria-label="Previous day"
            svgIcon={chevronLeftIcon}
            disabled={atRangeStart}
            onClick={goPrevious}
          />
          <Button
            role="button"
            tabIndex={-1}
            fillMode="flat"
            className="schedule-date-nav-label"
            aria-live="polite"
            aria-label={viewingToday ? "Today" : label}
            disabled={viewingToday}
            onClick={viewingToday ? undefined : goToday}
          >
            {label}
          </Button>
          <Button
            role="button"
            tabIndex={-1}
            title="Next day"
            aria-label="Next day"
            svgIcon={chevronRightIcon}
            disabled={atRangeEnd}
            onClick={goNext}
          />
        </ButtonGroup>
      </div>
    </SchedulerFooter>
  );
}
