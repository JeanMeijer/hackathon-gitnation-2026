"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import { Card, CardBody } from "@progress/kendo-react-layout";
import { calendarIcon } from "@progress/kendo-svg-icons";
import ProfileAvatar from "../components/profile-avatar";
import { formatScheduleDateParam } from "@/lib/schedule/conference";
import {
  getBookedMeetings,
  saveBookedMeeting,
  subscribeToBookedMeetings,
  type BookedMeeting,
} from "@/lib/schedule/booked-meetings";
import {
  getSentInvites,
  receivedInvites,
  type ReceivedInvite,
  type SentInvite,
  subscribeToSentInvites,
} from "./invite-data";
import styles from "./invites.module.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "Europe/Amsterdam",
});

function formatInviteDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

const emptySentInvites: SentInvite[] = [];
const emptyBookedMeetings: BookedMeeting[] = [];

function getScheduleHref(date: Date) {
  return `/?date=${formatScheduleDateParam(date)}`;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getDefaultMeetingStart(inviteId: string) {
  const defaults: Record<string, [number, number, number]> = {
    riley: [11, 13, 30],
    marco: [12, 10, 30],
    nora: [12, 14, 0],
    eli: [13, 11, 30],
  };
  const [day, hour, minute] = defaults[inviteId] ?? [12, 15, 0];

  return new Date(2026, 5, day, hour, minute);
}

function getDefaultLocation(inviteId: string) {
  const defaults: Record<string, string> = {
    riley: "Meetup lounge",
    marco: "Expo coffee bar",
    nora: "Hallway track tables",
    eli: "Accessibility corner",
  };

  return defaults[inviteId] ?? "GitNation venue";
}

function toDateTimeInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function parseDateTimeInput(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function InvitesView() {
  const router = useRouter();
  const sentInvites = useSyncExternalStore(
    subscribeToSentInvites,
    getSentInvites,
    () => emptySentInvites,
  );
  const bookedMeetings = useSyncExternalStore(
    subscribeToBookedMeetings,
    getBookedMeetings,
    () => emptyBookedMeetings,
  );
  const [bookingInvite, setBookingInvite] = useState<ReceivedInvite | null>(
    null,
  );
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const bookingStartDate = parseDateTimeInput(bookingStart);
  const bookingEndDate = parseDateTimeInput(bookingEnd);
  const cleanBookingLocation = bookingLocation.trim();
  const hasBookingError =
    bookingSubmitted &&
    (!bookingStartDate ||
      !bookingEndDate ||
      !cleanBookingLocation ||
      bookingEndDate.getTime() <= bookingStartDate.getTime());

  function getBookedMeeting(inviteId: string) {
    return bookedMeetings.find((meeting) => meeting.inviteId === inviteId);
  }

  function openBooking(invite: ReceivedInvite) {
    const bookedMeeting = getBookedMeeting(invite.id);
    const start = bookedMeeting?.start ?? getDefaultMeetingStart(invite.id);
    const end = bookedMeeting?.end ?? addMinutes(start, 30);

    setBookingInvite(invite);
    setBookingStart(toDateTimeInputValue(start));
    setBookingEnd(toDateTimeInputValue(end));
    setBookingLocation(bookedMeeting?.location ?? getDefaultLocation(invite.id));
    setBookingSubmitted(false);
  }

  function handleSaveBooking() {
    setBookingSubmitted(true);

    if (
      !bookingInvite ||
      !bookingStartDate ||
      !bookingEndDate ||
      !cleanBookingLocation ||
      bookingEndDate.getTime() <= bookingStartDate.getTime()
    ) {
      return;
    }

    saveBookedMeeting({
      inviteId: bookingInvite.id,
      name: bookingInvite.name,
      location: cleanBookingLocation,
      start: bookingStartDate,
      end: bookingEndDate,
    });
    setBookingInvite(null);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <h1 className={styles.title}>Invites</h1>
          <p className={styles.summary}>
            Track people who want to meet you and everyone you have invited from
            Discover.
          </p>
        </header>

        <div className={styles.grid}>
          <Card
            id="received"
            className={styles.panel}
            orientation="vertical"
          >
            <CardBody className={styles.panelBody}>
              <h2 className={styles.panelTitle}>
                Received invites ({receivedInvites.length})
              </h2>
              <div className={styles.inviteList}>
                {receivedInvites.map((invite) => {
                  const bookedMeeting = getBookedMeeting(invite.id);

                  return (
                    <article key={invite.id} className={styles.inviteCard}>
                      <div className={styles.inviteTop}>
                        <ProfileAvatar name={invite.name} size="small" />
                        <div className={styles.inviteIdentity}>
                          <p className={styles.inviteName}>{invite.name}</p>
                          <p className={styles.inviteMeta}>
                            {invite.title} · {invite.company}
                          </p>
                          <p className={styles.inviteMeta}>
                            {invite.match}% match ·{" "}
                            {formatInviteDate(invite.receivedAt)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={[
                          styles.status,
                          bookedMeeting ? styles.bookedStatus : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {bookedMeeting ? "booked" : invite.status}
                      </span>
                      <div className={styles.chips}>
                        {invite.interests.map((interest) => (
                          <Chip
                            key={interest}
                            className={styles.chip}
                            text={interest}
                            rounded="full"
                            fillMode="outline"
                            themeColor="info"
                          />
                        ))}
                      </div>
                      {bookedMeeting ? (
                        <div className={styles.bookingSummary}>
                          <p className={styles.bookingTitle}>
                            {formatInviteDate(bookedMeeting.start)} at{" "}
                            {bookedMeeting.location}
                          </p>
                          <p className={styles.inviteMeta}>
                            Added to your schedule as {bookedMeeting.title}.
                          </p>
                        </div>
                      ) : null}
                      <div className={styles.inviteActions}>
                        <Button
                          themeColor="primary"
                          fillMode={bookedMeeting ? "outline" : "solid"}
                          svgIcon={calendarIcon}
                          onClick={() => openBooking(invite)}
                        >
                          {bookedMeeting ? "Edit meet" : "Book meet"}
                        </Button>
                        {bookedMeeting ? (
                          <Button
                            fillMode="flat"
                            themeColor="primary"
                            onClick={() =>
                              router.push(getScheduleHref(bookedMeeting.start))
                            }
                          >
                            View schedule
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card id="sent" className={styles.panel} orientation="vertical">
            <CardBody className={styles.panelBody}>
              <h2 className={styles.panelTitle}>
                Sent invites ({sentInvites.length})
              </h2>
              {sentInvites.length > 0 ? (
                <div className={`${styles.inviteList} ${styles.sentInviteList}`}>
                  {sentInvites.map((invite) => (
                    <article
                      key={invite.id}
                      className={`${styles.inviteCard} ${styles.sentInviteCard}`}
                    >
                      <div className={styles.inviteTop}>
                        <ProfileAvatar name={invite.name} size="small" />
                        <div className={styles.inviteIdentity}>
                          <p className={styles.inviteName}>{invite.name}</p>
                          <p className={styles.inviteMeta}>
                            {invite.match}% match · sent{" "}
                            {formatInviteDate(invite.sentAt)}
                          </p>
                        </div>
                      </div>
                      <span className={styles.status}>{invite.status}</span>
                      <div className={styles.chips}>
                        {invite.interests.map((interest) => (
                          <Chip
                            key={interest}
                            className={styles.chip}
                            text={interest}
                            rounded="full"
                            fillMode="outline"
                            themeColor="success"
                          />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>
                  No sent invites yet. Use Discover and choose Meet to invite
                  people here.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {bookingInvite ? (
        <Dialog
          title={`Book meet with ${bookingInvite.name}`}
          width={460}
          onClose={() => setBookingInvite(null)}
        >
          <div className={styles.bookingForm}>
            <p className={styles.dialogSummary}>
              Choose a time and place. The meeting will appear on your schedule.
            </p>

            <div className={styles.field}>
              <Label editorId="booking-start">Start</Label>
              <input
                id="booking-start"
                className={styles.dateTimeInput}
                type="datetime-local"
                min="2026-06-11T08:00"
                max="2026-06-13T19:30"
                value={bookingStart}
                onChange={(event) => setBookingStart(event.currentTarget.value)}
              />
            </div>

            <div className={styles.field}>
              <Label editorId="booking-end">End</Label>
              <input
                id="booking-end"
                className={styles.dateTimeInput}
                type="datetime-local"
                min="2026-06-11T08:30"
                max="2026-06-13T20:00"
                value={bookingEnd}
                onChange={(event) => setBookingEnd(event.currentTarget.value)}
              />
            </div>

            <div className={styles.field}>
              <Label editorId="booking-location">Place</Label>
              <Input
                id="booking-location"
                value={bookingLocation}
                placeholder="Meetup lounge"
                onChange={(event) => setBookingLocation(event.value)}
              />
            </div>

            {hasBookingError ? (
              <p className={styles.errorText}>
                Add a place and choose an end time after the start time.
              </p>
            ) : null}
          </div>

          <DialogActionsBar layout="end">
            <Button onClick={() => setBookingInvite(null)}>Cancel</Button>
            <Button themeColor="primary" onClick={handleSaveBooking}>
              Add to schedule
            </Button>
          </DialogActionsBar>
        </Dialog>
      ) : null}
    </main>
  );
}
