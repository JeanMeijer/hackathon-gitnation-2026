"use client";

import { useSyncExternalStore, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { SvgIcon } from "@progress/kendo-react-common";
import { Button } from "@progress/kendo-react-buttons";
import {
  Avatar,
  Card,
  CardBody,
  CardTitle,
} from "@progress/kendo-react-layout";
import {
  envelopeIcon,
  inboxIcon,
  paperPlaneIcon,
} from "@progress/kendo-svg-icons";
import {
  getSentInvites,
  receivedInvites,
  subscribeToSentInvites,
  type SentInvite,
} from "../invites/invite-data";
import MySchedule from "./my-schedule";
import styles from "./home-dashboard.module.css";

function handleStatCardKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  route: string,
  navigate: (route: string) => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    navigate(route);
  }
}

const emptySentInvites: SentInvite[] = [];

export default function HomeDashboard() {
  const router = useRouter();
  const sentInvites = useSyncExternalStore(
    subscribeToSentInvites,
    getSentInvites,
    () => emptySentInvites
  );

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Your GitNation day</h1>
        </header>

        <section className={styles.grid}>
          <Card
            className={`${styles.card} ${styles.scheduleCard}`}
            orientation="vertical"
          >
            <CardBody className={styles.scheduleCardBody}>
              <MySchedule variant="embedded" />
            </CardBody>
          </Card>

          <Card
            className={`${styles.card} ${styles.meetsCard}`}
            orientation="vertical"
          >
            <CardBody className={styles.meetsBody}>
              <CardTitle className={styles.sectionTitle}>Meets</CardTitle>
              <Button
                className={styles.invitesButton}
                fillMode="outline"
                size="medium"
                themeColor="primary"
                svgIcon={envelopeIcon}
                onClick={() => router.push("/invites")}
              >
                Invites
              </Button>
              <div className={styles.stats}>
                <Card
                  className={styles.statCard}
                  orientation="vertical"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/invites#received")}
                  onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
                    handleStatCardKeyDown(event, "/invites#received", router.push)
                  }
                >
                  <CardBody className={styles.statCardBody}>
                    <Avatar
                      className={styles.statIcon}
                      type="icon"
                      size="medium"
                      themeColor="primary"
                      fillMode="outline"
                      rounded="medium"
                    >
                      <SvgIcon icon={inboxIcon} />
                    </Avatar>
                    <span className={styles.statValue}>
                      {receivedInvites.length}
                    </span>
                    <span className={styles.statLabel}>received</span>
                  </CardBody>
                </Card>
                <Card
                  className={styles.statCard}
                  orientation="vertical"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/invites#sent")}
                  onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
                    handleStatCardKeyDown(event, "/invites#sent", router.push)
                  }
                >
                  <CardBody className={styles.statCardBody}>
                    <Avatar
                      className={styles.statIcon}
                      type="icon"
                      size="medium"
                      themeColor="primary"
                      fillMode="outline"
                      rounded="medium"
                    >
                      <SvgIcon icon={paperPlaneIcon} />
                    </Avatar>
                    <span className={styles.statValue}>
                      {sentInvites.length}
                    </span>
                    <span className={styles.statLabel}>sent</span>
                  </CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </main>
  );
}
