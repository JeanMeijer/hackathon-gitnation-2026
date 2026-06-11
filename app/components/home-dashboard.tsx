"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Card, CardBody } from "@progress/kendo-react-layout";
import { envelopeIcon } from "@progress/kendo-svg-icons";
import {
  getSentInvites,
  receivedInvites,
  subscribeToSentInvites,
  type SentInvite,
} from "../invites/invite-data";
import {
  getBookedMeetings,
  subscribeToBookedMeetings,
  type BookedMeeting,
} from "@/lib/schedule/booked-meetings";
import {
  getCustomScheduleEvents,
  subscribeToCustomScheduleEvents,
} from "@/lib/schedule/custom-events";
import { createInitialScheduleEvents } from "@/lib/schedule/event-data";
import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";
import type { ScheduleEvent } from "@/lib/schedule/types";
import MySchedule from "./my-schedule";
import styles from "./home-dashboard.module.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Amsterdam",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

function formatLocation(event: ScheduleEvent) {
  if ("location" in event && event.location) {
    return event.location;
  }

  if ("trackName" in event && event.trackName) {
    return event.trackName;
  }

  return "GitNation venue";
}

const emptySentInvites: SentInvite[] = [];
const emptyBookedMeetings: BookedMeeting[] = [];
const emptyCustomEvents: ScheduleEvent[] = [];

export default function HomeDashboard() {
  const router = useRouter();
  const sentInvites = useSyncExternalStore(
    subscribeToSentInvites,
    getSentInvites,
    () => emptySentInvites
  );
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
  const scheduleEvents = useMemo(
    () =>
      [...baseEvents, ...bookedMeetings, ...customEvents].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      ),
    [baseEvents, bookedMeetings, customEvents]
  );
  const meets = useMemo(
    () =>
      scheduleEvents
        .filter((event) => event.type === "meeting")
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [scheduleEvents]
  );

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Your GitNation day</h1>
        </header>

        <section className={styles.grid}>
          <Card className={styles.card} orientation="vertical">
            <CardBody className={styles.scheduleCardBody}>
              <MySchedule variant="embedded" />
            </CardBody>
          </Card>

          <div className={styles.list}>
            <Card className={styles.card} orientation="vertical">
              <CardBody className={styles.cardBody}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Meets</h2>
                  <Button
                    fillMode="flat"
                    themeColor="primary"
                    svgIcon={envelopeIcon}
                    onClick={() => router.push("/invites")}
                  >
                    Invites
                  </Button>
                </div>
                <div className={styles.stats}>
                  <button
                    className={styles.stat}
                    type="button"
                    onClick={() => router.push("/invites#received")}
                  >
                    <span className={styles.statValue}>
                      {receivedInvites.length}
                    </span>
                    <span className={styles.statLabel}>received</span>
                  </button>
                  <button
                    className={styles.stat}
                    type="button"
                    onClick={() => router.push("/invites#sent")}
                  >
                    <span className={styles.statValue}>
                      {sentInvites.length}
                    </span>
                    <span className={styles.statLabel}>sent</span>
                  </button>
                </div>
                <div className={styles.inviteActions}>
                  <Button
                    fillMode="outline"
                    themeColor="primary"
                    svgIcon={envelopeIcon}
                    onClick={() => router.push("/invites#received")}
                  >
                    See invites
                  </Button>
                  <Button
                    fillMode="outline"
                    themeColor="primary"
                    onClick={() => router.push("/invites#sent")}
                  >
                    Sent invites
                  </Button>
                </div>
                <div className={styles.list}>
                  {meets.map((meet) => (
                    <article key={meet.id} className={styles.meetCard}>
                      <p className={styles.eventTitle}>{meet.title}</p>
                      <p className={styles.eventMeta}>
                        {dateFormatter.format(meet.start)} ·{" "}
                        {timeFormatter.format(meet.start)} ·{" "}
                        {formatLocation(meet)}
                      </p>
                    </article>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
