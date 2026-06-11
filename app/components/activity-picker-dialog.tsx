"use client";

import { useEffect, useMemo, useState } from "react";
import { SvgIcon } from "@progress/kendo-react-common";
import { Button } from "@progress/kendo-react-buttons";
import { TimeSelector } from "@progress/kendo-react-dateinputs";
import { Dialog } from "@progress/kendo-react-dialogs";
import {
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
} from "@progress/kendo-react-layout";
import {
  chevronLeftIcon,
  foodIcon,
  microphoneIcon,
  sparklesIcon,
  usersIcon,
  type SVGIcon,
} from "@progress/kendo-svg-icons";
import {
  createEventFromActivity,
  getActivitiesByType,
  getActivityTypeLabel,
  type PredefinedActivity,
} from "@/lib/schedule/activities";
import type { ScheduleEvent, ScheduleEventType } from "@/lib/schedule/types";

export interface ActivityPickerDraft {
  start: Date;
  end: Date;
}

interface ActivityPickerDialogProps {
  open: boolean;
  draft: ActivityPickerDraft | null;
  onClose: () => void;
  onConfirm: (event: ScheduleEvent) => void;
}

type EditingField = "start" | "end" | null;

const EVENT_TYPE_ORDER: ScheduleEventType[] = [
  "talk",
  "meeting",
  "break",
  "custom",
];

const EVENT_TYPE_ICONS: Record<ScheduleEventType, SVGIcon> = {
  talk: microphoneIcon,
  meeting: usersIcon,
  break: foodIcon,
  custom: sparklesIcon,
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

function getActivitySubtitle(activity: PredefinedActivity): string {
  const parts = [`${activity.durationMinutes} min`];

  if (activity.type === "talk" && activity.trackName) {
    parts.unshift(activity.trackName);
  } else if (activity.location) {
    parts.unshift(activity.location);
  } else if (activity.description) {
    parts.unshift(activity.description);
  }

  return parts.join(" · ");
}

function formatTime(date: Date | null): string {
  if (!date) {
    return "--:--";
  }

  return new Intl.DateTimeFormat(undefined, TIME_FORMAT).format(date);
}

function mergeTime(date: Date, time: Date): Date {
  const merged = new Date(date);
  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return merged;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getDurationMinutes(start: Date | null, end: Date | null) {
  if (!start || !end || end.getTime() <= start.getTime()) {
    return 30;
  }

  return Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
}

export default function ActivityPickerDialog({
  open,
  draft,
  onClose,
  onConfirm,
}: ActivityPickerDialogProps) {
  const [selectedType, setSelectedType] = useState<ScheduleEventType | null>(
    null
  );
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [editingField, setEditingField] = useState<EditingField>(null);

  const slotDurationMinutes = getDurationMinutes(start, end);

  const availableTypes = useMemo(
    () =>
      EVENT_TYPE_ORDER.filter(
        (type) => getActivitiesByType(type, slotDurationMinutes).length > 0
      ),
    [slotDurationMinutes]
  );

  const filteredActivities = useMemo(
    () =>
      selectedType
        ? getActivitiesByType(selectedType, slotDurationMinutes)
        : [],
    [selectedType, slotDurationMinutes]
  );

  useEffect(() => {
    if (!open || !draft) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setSelectedType(null);
      setStart(new Date(draft.start));
      setEnd(new Date(draft.end));
      setEditingField(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, draft]);

  const handleTimeFieldClick = (field: Exclude<EditingField, null>) => {
    setEditingField((current) => (current === field ? null : field));
  };

  const handleAddActivity = (activity: PredefinedActivity) => {
    if (!start) {
      return;
    }

    const eventEnd = addMinutes(start, activity.durationMinutes);
    onConfirm(createEventFromActivity(activity, start, eventEnd));
    onClose();
  };

  const handleTimeChange = (field: Exclude<EditingField, null>, time: Date) => {
    if (field === "start" && start) {
      const nextStart = mergeTime(start, time);
      const durationMinutes = getDurationMinutes(start, end);

      setStart(nextStart);
      setEnd(addMinutes(nextStart, durationMinutes));
      return;
    }

    if (field === "end" && end) {
      setEnd(mergeTime(end, time));
    }
  };

  const dialogTitle = "Add activity";

  const handleTypeSelect = (type: ScheduleEventType) => {
    setSelectedType(type);
  };

  const handleBackToTypes = () => {
    setSelectedType(null);
  };

  if (!open || !draft) {
    return null;
  }

  return (
    <Dialog title={dialogTitle} onClose={onClose} width={480}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {selectedType ? (
            <>
              <div className="activity-picker-category-header">
                <Button
                  type="button"
                  fillMode="flat"
                  className="activity-picker-back !justify-start !px-0"
                  svgIcon={chevronLeftIcon}
                  onClick={handleBackToTypes}
                >
                  All categories
                </Button>
                <span
                  className={`activity-picker-category-pill activity-picker-category-pill-${selectedType}`}
                >
                  <span aria-hidden="true">
                    <SvgIcon icon={EVENT_TYPE_ICONS[selectedType]} size="small" />
                  </span>
                  {getActivityTypeLabel(selectedType)}
                </span>
              </div>
              <div
                className="activity-picker-list -mx-1 max-h-72 overflow-y-auto px-1"
                role="list"
                aria-label={`${getActivityTypeLabel(selectedType)} activities`}
              >
                {filteredActivities.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {filteredActivities.map((activity) => (
                      <Card
                        key={activity.id}
                        role="listitem"
                        className="activity-picker-card"
                      >
                        <CardBody className="activity-picker-card-body !py-3">
                          <div className="activity-picker-card-copy">
                            <CardTitle className="!text-sm !font-medium">
                              {activity.title}
                            </CardTitle>
                            <CardSubtitle className="!text-xs">
                              {getActivitySubtitle(activity)}
                            </CardSubtitle>
                          </div>
                          <Button
                            type="button"
                            size="small"
                            themeColor="primary"
                            className="activity-picker-card-add"
                            onClick={() => handleAddActivity(activity)}
                          >
                            Add
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="px-1 py-6 text-center text-sm text-black/55">
                    No activities fit in the selected time slot.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div
              className="activity-picker-type-grid"
              role="group"
              aria-label="Activity categories"
            >
              {availableTypes.map((type) => {
                const count = getActivitiesByType(type, slotDurationMinutes)
                  .length;

                return (
                  <button
                    key={type}
                    type="button"
                    className={`activity-picker-type-button activity-picker-type-button-${type}`}
                    onClick={() => handleTypeSelect(type)}
                  >
                    <span
                      className="activity-picker-type-icon"
                      aria-hidden="true"
                    >
                      <SvgIcon icon={EVENT_TYPE_ICONS[type]} size="medium" />
                    </span>
                    <span className="activity-picker-type-copy">
                      <span className="activity-picker-type-label">
                        {getActivityTypeLabel(type)}
                      </span>
                    </span>
                    <span className="activity-picker-type-count">
                      {count} {count === 1 ? "option" : "options"}
                    </span>
                  </button>
                );
              })}
              {availableTypes.length === 0 ? (
                <p className="col-span-2 px-1 py-6 text-center text-sm text-black/55">
                  No activities fit in the selected time slot. Adjust the time
                  below to see more options.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              fillMode={editingField === "start" ? "solid" : "outline"}
              themeColor={editingField === "start" ? "primary" : "base"}
              aria-pressed={editingField === "start"}
              onClick={() => handleTimeFieldClick("start")}
            >
              {formatTime(start)}
            </Button>
            <span className="text-sm text-black/45" aria-hidden="true">
              –
            </span>
            <Button
              type="button"
              fillMode={editingField === "end" ? "solid" : "outline"}
              themeColor={editingField === "end" ? "primary" : "base"}
              aria-pressed={editingField === "end"}
              onClick={() => handleTimeFieldClick("end")}
            >
              {formatTime(end)}
            </Button>
          </div>

          {editingField && (
            <div className="activity-time-editor">
              <TimeSelector
                key={editingField}
                value={editingField === "start" ? start : end}
                show={true}
                footer={false}
                nowButton={false}
                cancelButton={false}
                format="t"
                handleTimeChange={(event: { time: Date }) =>
                  handleTimeChange(editingField, event.time)
                }
              />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
