"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { TimeSelector } from "@progress/kendo-react-dateinputs";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
} from "@progress/kendo-react-layout";
import {
  createEventFromActivity,
  getActivityTypeLabel,
  PREDEFINED_ACTIVITIES,
  type PredefinedActivity,
} from "@/lib/schedule/activities";
import { EVENT_TYPE_RESOURCE } from "@/lib/schedule/resources";
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

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

function getTypeColor(type: ScheduleEventType): string {
  const entry = EVENT_TYPE_RESOURCE.data?.find((item) => item.value === type);
  return entry?.color ?? "#656565";
}

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

export default function ActivityPickerDialog({
  open,
  draft,
  onClose,
  onConfirm,
}: ActivityPickerDialogProps) {
  const [selectedActivity, setSelectedActivity] =
    useState<PredefinedActivity | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [editingField, setEditingField] = useState<EditingField>(null);

  const groupedActivities = useMemo(() => {
    const byType = new Map<ScheduleEventType, PredefinedActivity[]>();

    for (const type of EVENT_TYPE_ORDER) {
      byType.set(type, []);
    }

    for (const activity of PREDEFINED_ACTIVITIES) {
      byType.get(activity.type)?.push(activity);
    }

    return EVENT_TYPE_ORDER.flatMap((type) => {
      const activities = (byType.get(type) ?? []).sort((a, b) =>
        a.title.localeCompare(b.title)
      );

      return activities.length > 0 ? [{ type, activities }] : [];
    });
  }, []);

  useEffect(() => {
    if (!open || !draft) {
      return;
    }

    setSelectedActivity(null);
    setStart(new Date(draft.start));
    setEnd(new Date(draft.end));
    setEditingField(null);
  }, [open, draft]);

  const canConfirm =
    selectedActivity != null &&
    start != null &&
    end != null &&
    end.getTime() > start.getTime();

  const handleTimeFieldClick = (field: Exclude<EditingField, null>) => {
    setEditingField((current) => (current === field ? null : field));
  };

  const handleTimeChange = (field: Exclude<EditingField, null>, time: Date) => {
    if (field === "start" && start) {
      setStart(mergeTime(start, time));
      return;
    }

    if (field === "end" && end) {
      setEnd(mergeTime(end, time));
    }
  };

  const handleConfirm = () => {
    if (!selectedActivity || !start || !end || !canConfirm) {
      return;
    }

    onConfirm(createEventFromActivity(selectedActivity, start, end));
    onClose();
  };

  if (!open || !draft) {
    return null;
  }

  return (
    <Dialog title="Add activity" onClose={onClose} width={480}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div
            className="activity-picker-list -mx-1 max-h-72 overflow-y-auto px-1"
            role="listbox"
            aria-label="Predefined activities"
          >
            {groupedActivities.map(({ type, activities }) => (
              <section key={type} className="mb-4 last:mb-0">
                <h3
                  className="activity-picker-group-title mb-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: getTypeColor(type) }}
                >
                  {getActivityTypeLabel(type)}
                </h3>
                <div className="flex flex-col gap-2">
                  {activities.map((activity) => {
                    const selected = selectedActivity?.id === activity.id;

                    return (
                      <Card
                        key={activity.id}
                        role="option"
                        aria-selected={selected}
                        tabIndex={0}
                        className={[
                          "activity-picker-card cursor-pointer transition-shadow",
                          selected ? "activity-picker-card-selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={
                          selected
                            ? {
                                borderColor: getTypeColor(activity.type),
                                boxShadow: `inset 0 0 0 1px ${getTypeColor(activity.type)}`,
                              }
                            : undefined
                        }
                        onClick={() => setSelectedActivity(activity)}
                        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedActivity(activity);
                          }
                        }}
                      >
                        <CardBody className="!py-3">
                          <CardTitle className="!text-sm !font-medium">
                            {activity.title}
                          </CardTitle>
                          <CardSubtitle className="!text-xs">
                            {getActivitySubtitle(activity)}
                          </CardSubtitle>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
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

      <DialogActionsBar layout="end">
        <Button onClick={onClose}>Cancel</Button>
        <Button themeColor="primary" disabled={!canConfirm} onClick={handleConfirm}>
          Add to schedule
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
