"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Button, Chip } from "@progress/kendo-react-buttons";
import { Card, CardBody } from "@progress/kendo-react-layout";
import { calendarIcon } from "@progress/kendo-svg-icons";
import ProfileAvatar from "../components/profile-avatar";
import { formatScheduleDateParam } from "@/lib/schedule/conference";
import {
  getBookedMeetings,
  subscribeToBookedMeetings,
  type BookedMeeting,
} from "@/lib/schedule/booked-meetings";
import styles from "./contacts.module.css";

type MetContact = {
  company: string;
  id: string;
  interests: string[];
  location: string;
  metAt: string;
  name: string;
  note: string;
  title: string;
};

const emptyBookedMeetings: BookedMeeting[] = [];

const metContacts: MetContact[] = [
  {
    company: "Runtime Labs",
    id: "riley-met",
    interests: ["React", "Accessibility", "Testing"],
    location: "Meetup lounge",
    metAt: "2026-06-11T14:20:00.000+02:00",
    name: "Riley Chen",
    note: "Shared testing patterns for accessible component libraries.",
    title: "Design Engineer",
  },
  {
    company: "EdgeWorks",
    id: "marco-met",
    interests: ["Next.js", "APIs", "AI Agents"],
    location: "Expo coffee bar",
    metAt: "2026-06-11T16:10:00.000+02:00",
    name: "Marco Silva",
    note: "Talked through API workflows and agent handoff ideas.",
    title: "Platform Engineer",
  },
  {
    company: "Northstar Design",
    id: "zoe-met",
    interests: ["Design Systems", "KendoReact", "Motion"],
    location: "Design systems booth",
    metAt: "2026-06-12T09:45:00.000+02:00",
    name: "Zoe Ivers",
    note: "Compared design token approaches for event apps.",
    title: "Design Systems Lead",
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "Europe/Amsterdam",
  weekday: "short",
});

function formatContactDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

function getScheduleHref(date: Date) {
  return `/?date=${formatScheduleDateParam(date)}`;
}

function getMeetingContactName(meeting: BookedMeeting) {
  return meeting.attendees?.[0] ?? meeting.title.replace(/^Meet\s+/i, "");
}

interface ContactsViewProps {
  onOpenInvites: () => void;
}

export default function ContactsView({ onOpenInvites }: ContactsViewProps) {
  const router = useRouter();
  const bookedMeetings = useSyncExternalStore(
    subscribeToBookedMeetings,
    getBookedMeetings,
    () => emptyBookedMeetings,
  );

  return (
    <div className="grid gap-6 px-4">
      <header className="flex flex-col gap-2 text-start">
        <h1 className="text-xl font-extrabold leading-tight text-neutral-900">
          Contacts
        </h1>
        <p className="leading-normal text-neutral-500">
          People you have met at GitNation and the meetups already on your
          schedule.
        </p>
      </header>
      <section className={styles.grid} aria-label="Contacts lists">
          <Card className={styles.panel} orientation="vertical">
            <CardBody className={styles.panelBody}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  People met ({metContacts.length})
                </h2>
              </div>

              <div className={styles.contactList}>
                {metContacts.map((contact) => (
                  <article key={contact.id} className={styles.contactCard}>
                    <div className={styles.contactTop}>
                      <ProfileAvatar name={contact.name} size="small" />
                      <div className={styles.identity}>
                        <p className={styles.name}>{contact.name}</p>
                        <p className={styles.meta}>
                          {contact.title} · {contact.company}
                        </p>
                      </div>
                    </div>

                    <dl className={styles.details}>
                      <div>
                        <dt>Met</dt>
                        <dd>{formatContactDate(contact.metAt)}</dd>
                      </div>
                      <div>
                        <dt>Place</dt>
                        <dd>{contact.location}</dd>
                      </div>
                    </dl>

                    <p className={styles.note}>{contact.note}</p>

                    <div className={styles.chips} aria-label="Shared interests">
                      {contact.interests.map((interest) => (
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
                  </article>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className={styles.panel} orientation="vertical">
            <CardBody className={styles.panelBody}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  Scheduled meets ({bookedMeetings.length})
                </h2>
                <Button
                  fillMode="flat"
                  themeColor="primary"
                  onClick={onOpenInvites}
                >
                  Invites
                </Button>
              </div>

              {bookedMeetings.length ? (
                <div className={styles.contactList}>
                  {bookedMeetings.map((meeting) => {
                    const name = getMeetingContactName(meeting);

                    return (
                      <article key={meeting.id} className={styles.contactCard}>
                        <div className={styles.contactTop}>
                          <ProfileAvatar name={name} size="small" />
                          <div className={styles.identity}>
                            <p className={styles.name}>{name}</p>
                            <p className={styles.meta}>{meeting.title}</p>
                          </div>
                        </div>

                        <dl className={styles.details}>
                          <div>
                            <dt>Time</dt>
                            <dd>{formatContactDate(meeting.start)}</dd>
                          </div>
                          <div>
                            <dt>Place</dt>
                            <dd>{meeting.location ?? "GitNation venue"}</dd>
                          </div>
                        </dl>

                        <div className={styles.actions}>
                          <Button
                            themeColor="primary"
                            fillMode="outline"
                            svgIcon={calendarIcon}
                            onClick={() =>
                              router.push(getScheduleHref(meeting.start))
                            }
                          >
                            View schedule
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.empty}>
                  <p className={styles.emptyTitle}>No scheduled meets yet</p>
                  <p className={styles.emptyCopy}>
                    Book a time from Received invites and it will appear here.
                  </p>
                  <Button
                    themeColor="primary"
                    onClick={onOpenInvites}
                  >
                    Open invites
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
      </section>
    </div>
  );
}
