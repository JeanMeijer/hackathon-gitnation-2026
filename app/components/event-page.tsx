"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Button, Chip } from "@progress/kendo-react-buttons";
import { Card, CardBody, CardSubtitle, CardTitle } from "@progress/kendo-react-layout";
import { chevronLeftIcon } from "@progress/kendo-svg-icons";
import {
  defaultUserProfile,
  getProfileSnapshot,
  subscribeToProfile,
} from "@/app/profile/profile-data";
import {
  formatEventDate,
  formatEventTimeRange,
  getEventDescription,
  getEventLobbyAttendeeNames,
  getEventTypeLabel,
  getMockEventById,
} from "@/lib/schedule/event-lookup";
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

function EventDetails({ event }: { event: ScheduleEvent }) {
  const description = getEventDescription(event);

  return (
    <Card className="border-0 shadow-none">
      <CardBody className="flex flex-col gap-5 p-0">
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            text={getEventTypeLabel(event.type)}
            rounded="full"
            fillMode="outline"
            themeColor="info"
          />
        </div>

        <dl className="grid gap-4">
          <EventMetaRow
            label="When"
            value={`${formatEventDate(event.start)} · ${formatEventTimeRange(event.start, event.end)}`}
          />

          {event.type === "talk" && event.trackName ? (
            <EventMetaRow label="Track" value={event.trackName} />
          ) : null}

          {(event.type === "meeting" ||
            event.type === "custom" ||
            event.type === "break") &&
          event.location ? (
            <EventMetaRow label="Location" value={event.location} />
          ) : null}
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

export default function EventPage({ eventId }: EventPageProps) {
  const router = useRouter();
  const event = getMockEventById(eventId);
  const profile = useSyncExternalStore(
    subscribeToProfile,
    () => getProfileSnapshot(defaultUserProfile),
    () => defaultUserProfile,
  );

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
          onClick={() => router.push("/")}
        >
          Back to schedule
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold leading-tight">{event.title}</h1>
          <EventDetails event={event} />
        </div>

        <EventLobby event={event} currentUserName={profile.name} />
      </div>
    </main>
  );
}
