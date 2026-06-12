"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { SvgIcon } from "@progress/kendo-react-common";
import { Button } from "@progress/kendo-react-buttons";
import {
  Avatar,
  Card,
  CardBody,
  CardTitle,
  TabStrip,
  TabStripSelectEventArguments,
  TabStripTab,
} from "@progress/kendo-react-layout";
import {
  checkIcon,
  envelopeIcon,
  inboxIcon,
  paperPlaneIcon,
} from "@progress/kendo-svg-icons";
import { defaultUserProfile, type UserProfile } from "../profile/profile-data";
import {
  getSentInvites,
  receivedInvites,
  subscribeToSentInvites,
  type SentInvite,
} from "../invites/invite-data";
import MySchedule from "./my-schedule";
import styles from "./home-dashboard.module.css";

type Booth = {
  boothNumber: string;
  id: string;
  interests: string[];
  name: string;
  summary: string;
  zone: string;
};

type RankedBooth = Booth & {
  matchedInterests: string[];
  score: number;
};

const conferenceBooths: Booth[] = [
  {
    id: "progress-design-systems",
    boothNumber: "A12",
    interests: ["React", "KendoReact", "Design Systems", "Accessibility"],
    name: "Progress Design Systems Lab",
    summary: "Hands-on KendoReact patterns, component theming, and accessible UI.",
    zone: "Expo Hall A",
  },
  {
    id: "agent-studio",
    boothNumber: "B04",
    interests: ["AI Agents", "APIs", "TypeScript", "Product Strategy"],
    name: "Agent Studio",
    summary: "Prototype agent workflows and learn how teams ship AI features.",
    zone: "Expo Hall B",
  },
  {
    id: "edge-data-cloud",
    boothNumber: "C08",
    interests: ["Next.js", "Postgres", "APIs", "Node.js"],
    name: "Edge Data Cloud",
    summary: "Edge runtimes, database performance, and modern API deployments.",
    zone: "Cloud Pavilion",
  },
  {
    id: "quality-hub",
    boothNumber: "D03",
    interests: ["Testing", "Accessibility", "React", "Mentoring"],
    name: "Quality Hub",
    summary: "Testing clinics, accessibility audits, and quality mentoring.",
    zone: "Community Hall",
  },
  {
    id: "graphql-garden",
    boothNumber: "B17",
    interests: ["GraphQL", "Node.js", "TypeScript", "Community Building"],
    name: "GraphQL Garden",
    summary: "Schema design reviews, resolver debugging, and API community meetups.",
    zone: "API Alley",
  },
];

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
const emptyVisitedBooths: string[] = [];
const visitedBoothsStorageKey = "gitnation-visited-booths";
const visitedBoothsEventName = "gitnation-visited-booths-updated";

let cachedRawVisitedBooths: string | null | undefined;
let cachedVisitedBooths: string[] | undefined;

function getVisitedBoothIds() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawVisitedBooths = window.localStorage.getItem(visitedBoothsStorageKey);

  if (rawVisitedBooths === cachedRawVisitedBooths) {
    return cachedVisitedBooths ?? [];
  }

  cachedRawVisitedBooths = rawVisitedBooths;

  if (!rawVisitedBooths) {
    cachedVisitedBooths = [];
    return [];
  }

  try {
    cachedVisitedBooths = JSON.parse(rawVisitedBooths) as string[];
  } catch {
    cachedVisitedBooths = [];
  }

  return cachedVisitedBooths;
}

function markBoothVisited(boothId: string) {
  const nextVisitedBooths = [
    boothId,
    ...getVisitedBoothIds().filter((visitedBoothId) => visitedBoothId !== boothId),
  ];
  const serializedVisitedBooths = JSON.stringify(nextVisitedBooths);

  window.localStorage.setItem(visitedBoothsStorageKey, serializedVisitedBooths);
  cachedRawVisitedBooths = serializedVisitedBooths;
  cachedVisitedBooths = nextVisitedBooths;
  window.dispatchEvent(new Event(visitedBoothsEventName));
}

function subscribeToVisitedBooths(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === visitedBoothsStorageKey) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(visitedBoothsEventName, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(visitedBoothsEventName, callback);
  };
}

function rankBooths(interests: string[]): RankedBooth[] {
  const interestSet = new Set(interests.map((interest) => interest.toLowerCase()));

  return conferenceBooths
    .map((booth) => {
      const matchedInterests = booth.interests.filter((interest) =>
        interestSet.has(interest.toLowerCase()),
      );

      return {
        ...booth,
        matchedInterests,
        score: matchedInterests.length,
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 4);
}

export default function HomeDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [boothTab, setBoothTab] = useState(0);
  const sentInvites = useSyncExternalStore(
    subscribeToSentInvites,
    getSentInvites,
    () => emptySentInvites
  );
  const visitedBoothIds = useSyncExternalStore(
    subscribeToVisitedBooths,
    getVisitedBoothIds,
    () => emptyVisitedBooths,
  );
  const visitedBoothIdSet = useMemo(
    () => new Set(visitedBoothIds),
    [visitedBoothIds],
  );
  const recommendedBooths = useMemo(
    () =>
      rankBooths(profile.interests).filter(
        (booth) => !visitedBoothIdSet.has(booth.id),
      ),
    [profile.interests, visitedBoothIdSet],
  );
  const visitedBooths = useMemo(
    () =>
      visitedBoothIds
        .map((boothId) => conferenceBooths.find((booth) => booth.id === boothId))
        .filter((booth): booth is Booth => Boolean(booth)),
    [visitedBoothIds],
  );

  useEffect(() => {
    let active = true;

    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : defaultUserProfile))
      .then((data: UserProfile) => {
        if (active) {
          setProfile(data);
        }
      })
      .catch(() => {
        if (active) {
          setProfile(defaultUserProfile);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleBoothTabSelect(event: TabStripSelectEventArguments) {
    setBoothTab(event.selected);
  }

  function handleMarkVisited(booth: Booth) {
    markBoothVisited(booth.id);
    setBoothTab(1);
  }

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
                onClick={() => router.push("/people")}
              >
                Invites
              </Button>
              <div className={styles.stats}>
                <Card
                  className={styles.statCard}
                  orientation="vertical"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/people#received")}
                  onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
                    handleStatCardKeyDown(event, "/people#received", router.push)
                  }
                >
                  <CardBody className={styles.statCardBody}>
                    <Avatar
                      className={styles.statIcon}
                      type="icon"
                      size="medium"
                      themeColor="primary"
                      fillMode="outline"
                      rounded="full"
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
                  onClick={() => router.push("/people#sent")}
                  onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
                    handleStatCardKeyDown(event, "/people#sent", router.push)
                  }
                >
                  <CardBody className={styles.statCardBody}>
                    <Avatar
                      className={styles.statIcon}
                      type="icon"
                      size="medium"
                      themeColor="primary"
                      fillMode="outline"
                      rounded="full"
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

              <section
                className={styles.boothSection}
                aria-labelledby="booth-section-title"
              >
                <div className={styles.boothHeader}>
                  <div>
                    <h2 id="booth-section-title" className={styles.sectionTitle}>
                      Booths for you
                    </h2>
                    <p className={styles.boothSubtitle}>
                      Based on {profile.interests.slice(0, 3).join(", ") || "your profile"}
                    </p>
                  </div>
                </div>

                <TabStrip
                  className={styles.boothTabs}
                  selected={boothTab}
                  tabAlignment="stretched"
                  animation={false}
                  keepTabsMounted
                  renderAllContent
                  onSelect={handleBoothTabSelect}
                >
                  <TabStripTab title={`Recommended (${recommendedBooths.length})`}>
                    <div className={styles.boothTabPanel}>
                      {recommendedBooths.length > 0 ? (
                        <div className={styles.boothList}>
                          {recommendedBooths.map((booth) => {
                            const matches =
                              booth.matchedInterests.length > 0
                                ? booth.matchedInterests
                                : booth.interests.slice(0, 2);

                            return (
                              <article key={booth.id} className={styles.boothCard}>
                                <div className={styles.boothCopy}>
                                  <p className={styles.boothName}>{booth.name}</p>
                                  <p className={styles.boothMeta}>
                                    {booth.zone} · Booth {booth.boothNumber}
                                  </p>
                                  <p className={styles.boothSummary}>
                                    {booth.summary}
                                  </p>
                                  <div
                                    className={styles.boothTags}
                                    aria-label="Matched interests"
                                  >
                                    {matches.map((interest) => (
                                      <span
                                        key={interest}
                                        className={styles.boothTag}
                                      >
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className={styles.boothActions}>
                                  <Button
                                    fillMode="solid"
                                    size="small"
                                    themeColor="primary"
                                    svgIcon={checkIcon}
                                    onClick={() => handleMarkVisited(booth)}
                                  >
                                    Mark visited
                                  </Button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={styles.emptyBooths}>
                          All recommended booths are marked visited.
                        </p>
                      )}
                    </div>
                  </TabStripTab>
                  <TabStripTab title={`Visited (${visitedBooths.length})`}>
                    <div className={styles.boothTabPanel}>
                      {visitedBooths.length > 0 ? (
                        <div className={styles.boothList}>
                          {visitedBooths.map((booth) => (
                            <article key={booth.id} className={styles.boothCard}>
                              <div className={styles.boothCopy}>
                                <p className={styles.boothName}>{booth.name}</p>
                                <p className={styles.boothMeta}>
                                  {booth.zone} · Booth {booth.boothNumber}
                                </p>
                                <p className={styles.boothSummary}>
                                  {booth.summary}
                                </p>
                                <div
                                  className={styles.boothTags}
                                  aria-label="Booth interests"
                                >
                                  {booth.interests.slice(0, 3).map((interest) => (
                                    <span key={interest} className={styles.boothTag}>
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className={styles.visitedBadge}>
                                <SvgIcon icon={checkIcon} size="small" />
                                Visited
                              </span>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.emptyBooths}>
                          No booths visited yet. Mark booths as visited from the
                          recommended tab.
                        </p>
                      )}
                    </div>
                  </TabStripTab>
                </TabStrip>
              </section>
            </CardBody>
          </Card>
        </section>
      </div>
    </main>
  );
}
