"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Card, CardBody, CardSubtitle, CardTitle } from "@progress/kendo-react-layout";
import { chevronLeftIcon, directionsIcon } from "@progress/kendo-svg-icons";
import EventMapDialog from "@/app/components/event-map-dialog";
import JoinedBadge from "@/app/components/joined-badge";
import {
  defaultUserProfile,
  getProfileSnapshot,
  subscribeToProfile,
} from "@/app/profile/profile-data";
import {
  addCustomScheduleEvent,
} from "@/lib/schedule/custom-events";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import {
  isEventOnUserSchedule,
  removeEventFromUserSchedule,
  subscribeToUserScheduleMembership,
} from "@/lib/schedule/user-schedule-membership";
import {
  formatEventDate,
  formatEventTimeRange,
  getEventDescription,
  getEventLocationDisplay,
  getEventLobbyAttendeeNames,
  getEventTypeLabel,
  getScheduleEventById,
  isConferenceEvent,
} from "@/lib/schedule/event-lookup";
import { getEventTypeThemeClass } from "@/lib/schedule/event-type-theme";
import type { ScheduleEvent } from "@/lib/schedule/types";

interface EventPageProps {
  eventId: string;
}

function EventMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
        {label}
      </dt>
      <dd className="text-sm text-black/80">{value}</dd>
    </div>
  );
}

function EventLocationRow({
  location,
  onViewMap,
}: {
  location: string;
  onViewMap: () => void;
}) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-black/45">
        Location
      </dt>
      <dd className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/80">
        <span>{location}</span>
        <Button fillMode="flat" themeColor="primary" size="small" onClick={onViewMap}>
          View on map
        </Button>
      </dd>
    </div>
  );
}

function EventDetails({
  event,
  joined,
  onUnregister,
  onViewMap,
}: {
  event: ScheduleEvent;
  joined: boolean;
  onUnregister: () => void;
  onViewMap: () => void;
}) {
  const description = getEventDescription(event);

  return (
    <Card className="event-details-card border-0 shadow-none">
      <CardBody className="relative flex flex-col gap-5 p-0">
        {joined ? (
          <div className="event-details-joined-controls">
            <JoinedBadge className="event-details-joined-badge" />
            <button
              type="button"
              className="event-details-unregister-btn"
              onClick={onUnregister}
            >
              Unregister
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "event-type-label-pill",
              getEventTypeThemeClass(event.type, "event-type-label-pill"),
            ].join(" ")}
          >
            {getEventTypeLabel(event.type)}
          </span>
        </div>

        <dl className="grid gap-4">
          <EventMetaRow
            label="When"
            value={`${formatEventDate(event.start)} · ${formatEventTimeRange(event.start, event.end)}`}
          />

          {event.type === "talk" && event.trackName ? (
            <EventMetaRow label="Track" value={event.trackName} />
          ) : null}

          <EventLocationRow
            location={getEventLocationDisplay(event)}
            onViewMap={onViewMap}
          />
        </dl>

        {description ? (
          <section aria-labelledby="event-description">
            <h2
              id="event-description"
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/45"
            >
              Description
            </h2>
            <p className="text-base leading-relaxed text-black/80">
              {description}
            </p>
          </section>
        ) : null}
      </CardBody>
    </Card>
  );
}

function EventLobby({
  event,
  currentUserName,
}: {
  event: ScheduleEvent;
  currentUserName: string;
}) {
  const otherAttendees = getEventLobbyAttendeeNames(event).filter(
    (name) => name.trim().toLowerCase() !== currentUserName.trim().toLowerCase(),
  );

  return (
    <section aria-labelledby="event-lobby" className="flex flex-col gap-3">
      <h2 id="event-lobby" className="text-lg font-semibold">
        Lobby
      </h2>

      <ul className="flex flex-wrap gap-2">
        <li>
          <Card className="w-fit border border-black/8">
            <CardBody className="px-3 py-2">
              <CardTitle className="text-sm font-medium">
                {currentUserName}
              </CardTitle>
              <CardSubtitle className="text-xs text-black/55">You</CardSubtitle>
            </CardBody>
          </Card>
        </li>

        {otherAttendees.map((name) => (
          <li key={name}>
            <Card className="w-fit border border-black/8">
              <CardBody className="px-3 py-2">
                <CardTitle className="text-sm font-medium">{name}</CardTitle>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EventNotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-black/10 px-4 py-3">
        <Button
          fillMode="flat"
          themeColor="primary"
          svgIcon={chevronLeftIcon}
          onClick={() => router.push("/")}
        >
          Back to schedule
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <h1 className="text-xl font-semibold">Event not found</h1>
        <p className="max-w-sm text-sm text-black/60">
          This event is not in your schedule. It may have been removed or the
          link is incorrect.
        </p>
        <Button themeColor="primary" onClick={() => router.push("/")}>
          Back to schedule
        </Button>
      </div>
    </main>
  );
}

function EventJoinAction({
  event,
  joined,
  onJoin,
  onNavigate,
}: {
  event: ScheduleEvent;
  joined: boolean;
  onJoin: () => void;
  onNavigate: () => void;
}) {
  const joinable = isConferenceEvent(event);

  if (!joined && !joinable) {
    return null;
  }

  return (
    <div className="border-t border-black/10 px-4 py-4">
      {joined ? (
        <Button
          fillMode="solid"
          themeColor="primary"
          svgIcon={directionsIcon}
          size="large"
          className="w-full"
          onClick={onNavigate}
        >
          Navigate
        </Button>
      ) : (
        <Button
          fillMode="solid"
          themeColor="primary"
          size="large"
          className="w-full"
          onClick={onJoin}
        >
          Join event
        </Button>
      )}
    </div>
  );
}

export default function EventPage({ eventId }: EventPageProps) {
  const router = useRouter();
  const [mapOpen, setMapOpen] = useState(false);
  const event = getScheduleEventById(eventId);
  const profile = useSyncExternalStore(
    subscribeToProfile,
    () => getProfileSnapshot(defaultUserProfile),
    () => defaultUserProfile,
  );
  const joined = useSyncExternalStore(
    subscribeToUserScheduleMembership,
    () => isEventOnUserSchedule(eventId),
    () => MOCK_USER_SCHEDULE.some((item) => item.id === eventId),
  );

  const handleJoin = () => {
    if (!event) {
      return;
    }

    addCustomScheduleEvent(event);
  };

  const handleUnregister = () => {
    if (!event) {
      return;
    }

    removeEventFromUserSchedule(event.id);
  };

  if (!event) {
    return <EventNotFound />;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-black/10 px-4 py-3">
        <Button
          fillMode="flat"
          themeColor="primary"
          svgIcon={chevronLeftIcon}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold leading-tight">{event.title}</h1>
          <EventDetails
            event={event}
            joined={joined}
            onUnregister={handleUnregister}
            onViewMap={() => setMapOpen(true)}
          />
        </div>

        <EventLobby event={event} currentUserName={profile.name} />
      </div>

      <EventJoinAction
        event={event}
        joined={joined}
        onJoin={handleJoin}
        onNavigate={() => setMapOpen(true)}
      />

      <EventMapDialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={event.title}
      />
    </main>
  );
}
