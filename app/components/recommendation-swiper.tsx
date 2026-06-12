"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Button } from "@progress/kendo-react-buttons";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@progress/kendo-react-layout";
import { cancelIcon, usersIcon } from "@progress/kendo-svg-icons";
import {
  getSentInvites,
  saveSentInvite,
  subscribeToSentInvites,
  type SentInvite,
} from "../invites/invite-data";
import ProfileAvatar from "./profile-avatar";
import styles from "./recommendation-swiper.module.css";

type Decision = "next" | "meet";

type Profile = {
  company: string;
  description: string;
  id: string;
  name: string;
  technologies: string[];
  title: string;
  match: number;
};

type DragState = {
  active: boolean;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

type CardVars = CSSProperties & {
  "--drag-x": string;
  "--drag-y": string;
  "--drag-rotation": string;
  "--stack-y": string;
  "--card-scale": string;
  "--card-opacity": string;
};

const profiles: Profile[] = [
  {
    company: "TechCorp",
    description:
      "Frontend developer with a passion for React and design systems.",
    id: "mira",
    name: "Mira Patel",
    technologies: ["React", "KendoReact", "Design Systems", "TypeScript"],
    title: "Frontend Developer",
    match: 96,
  },
  {
    company: "Runtime Labs",
    description:
      "Builds product-facing infrastructure for server-rendered apps and data-rich workflows.",
    id: "noah",
    name: "Noah Kim",
    technologies: ["Next.js", "Postgres", "Drizzle", "Data Viz"],
    title: "Full-stack Engineer",
    match: 91,
  },
  {
    company: "QueryCraft",
    description:
      "Creates developer tools that make APIs easier to model, test, and explain.",
    id: "lena",
    name: "Lena Ortiz",
    technologies: ["Node.js", "GraphQL", "Developer Tools", "DX"],
    title: "Developer Experience Lead",
    match: 88,
  },
  {
    company: "AgentWorks",
    description:
      "Designs agentic workflows for teams automating internal tools and support systems.",
    id: "samir",
    name: "Samir Haddad",
    technologies: ["AI Agents", "Python", "APIs", "Automation"],
    title: "AI Platform Engineer",
    match: 84,
  },
  {
    company: "Signal Studio",
    description:
      "Researches accessible mobile experiences and test strategies for product teams.",
    id: "ava",
    name: "Ava Brooks",
    technologies: ["Accessibility", "React Native", "Testing", "UX Research"],
    title: "UX Engineer",
    match: 79,
  },
  {
    company: "EdgeWorks",
    description:
      "Keeps real-time systems observable, resilient, and fast at the network edge.",
    id: "kai",
    name: "Kai Morgan",
    technologies: ["Edge Runtime", "WebSockets", "Node.js", "Observability"],
    title: "Infrastructure Engineer",
    match: 86,
  },
  {
    company: "Northstar Design",
    description:
      "Bridges component libraries and interaction design for polished product surfaces.",
    id: "zoe",
    name: "Zoe Ivers",
    technologies: ["Design Systems", "Figma Plugins", "KendoReact", "Motion"],
    title: "Design Systems Lead",
    match: 83,
  },
  {
    company: "TrustLayer",
    description:
      "Ships secure auth flows and backend APIs for teams with strict compliance needs.",
    id: "dante",
    name: "Dante Ford",
    technologies: ["APIs", "Auth", "Postgres", "Security"],
    title: "Security Engineer",
    match: 81,
  },
  {
    company: "ProductLoop",
    description:
      "Turns AI prototypes into clear product decisions, evals, and launch plans.",
    id: "mina",
    name: "Mina Rao",
    technologies: ["AI Agents", "RAG", "TypeScript", "Product Strategy"],
    title: "AI Product Strategist",
    match: 89,
  },
  {
    company: "Shipshape CI",
    description:
      "Helps teams make automated tests faster, calmer, and easier to debug.",
    id: "oscar",
    name: "Oscar Novak",
    technologies: ["Testing", "Playwright", "CI", "Developer Experience"],
    title: "Quality Engineer",
    match: 77,
  },
  {
    company: "Open Frontend",
    description:
      "Builds inclusive developer communities around mentoring, accessibility, and React.",
    id: "imani",
    name: "Imani Reed",
    technologies: ["Accessibility", "Community Building", "React", "Mentoring"],
    title: "Community Engineer",
    match: 85,
  },
];

const initialDrag: DragState = {
  active: false,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
};

const emptySentInvites: SentInvite[] = [];
const swipeThreshold = 96;
const ringRadius = 54;
const ringCircumference = 2 * Math.PI * ringRadius;

export default function RecommendationSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drag, setDrag] = useState<DragState>(initialDrag);
  const [exiting, setExiting] = useState<{
    profileId: string;
    direction: Decision;
  } | null>(null);
  const [announcement, setAnnouncement] = useState(
    "Recommendations loaded.",
  );
  const animationTimer = useRef<number | null>(null);
  const sentInvites = useSyncExternalStore(
    subscribeToSentInvites,
    getSentInvites,
    () => emptySentInvites,
  );
  const sentInviteIds = useMemo(
    () => new Set(sentInvites.map((invite) => invite.id)),
    [sentInvites],
  );
  const recommendations = useMemo(
    () =>
      profiles.filter(
        (profile) =>
          !sentInviteIds.has(profile.id) || exiting?.profileId === profile.id,
      ),
    [exiting?.profileId, sentInviteIds],
  );

  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        window.clearTimeout(animationTimer.current);
      }
    };
  }, []);

  const activeIndex = Math.min(currentIndex, recommendations.length);
  const activeProfile = recommendations[activeIndex];
  const visibleProfiles = recommendations.slice(activeIndex, activeIndex + 3);
  const dragIntent = drag.x > 28 ? "meet" : drag.x < -28 ? "next" : undefined;

  function commitSwipe(direction: Decision) {
    if (!activeProfile || exiting) {
      return;
    }

    const nextProfile = recommendations[activeIndex + 1];
    const nextTotal =
      direction === "meet"
        ? Math.max(recommendations.length - 1, 0)
        : recommendations.length;
    const nextPosition =
      direction === "meet" ? activeIndex + 1 : activeIndex + 2;

    setExiting({ profileId: activeProfile.id, direction });
    setDrag(initialDrag);

    if (direction === "meet") {
      saveSentInvite({
        id: activeProfile.id,
        interests: activeProfile.technologies,
        match: activeProfile.match,
        name: activeProfile.name,
      });
    }

    setAnnouncement(
      `${direction === "meet" ? "Meet selected for" : "See you next time for"} ${
        activeProfile.name
      }. ${
        nextProfile
          ? `Showing ${nextProfile.name}, profile ${nextPosition} of ${nextTotal}.`
          : "All recommendations reviewed."
      }`,
    );

    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    animationTimer.current = window.setTimeout(() => {
      setCurrentIndex((index) =>
        direction === "meet"
          ? Math.min(activeIndex, recommendations.length)
          : Math.min(index + 1, recommendations.length),
      );
      setExiting(null);
    }, 430);
  }

  function resetDeck() {
    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    setCurrentIndex(0);
    setDrag(initialDrag);
    setExiting(null);
    setAnnouncement(
      recommendations[0]
        ? `Showing ${recommendations[0].name}, profile 1 of ${recommendations.length}.`
        : "All recommendations reviewed.",
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!activeProfile || exiting) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      x: 0,
      y: 0,
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.active || exiting) {
      return;
    }

    setDrag((state) => ({
      ...state,
      x: event.clientX - state.startX,
      y: event.clientY - state.startY,
    }));
  }

  function handlePointerUp() {
    if (!drag.active || exiting) {
      return;
    }

    if (Math.abs(drag.x) >= swipeThreshold) {
      commitSwipe(drag.x > 0 ? "meet" : "next");
      return;
    }

    setDrag(initialDrag);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      commitSwipe("next");
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      commitSwipe("meet");
    }
  }

  if (!activeProfile) {
    return (
      <main className={styles.shell}>
        <section className={styles.stage} aria-labelledby="swiper-title">
          <div className={styles.heading}>
            <h1 id="swiper-title" className={styles.title}>
              Recommended profiles
            </h1>
            <p className={styles.counter}>All caught up</p>
          </div>
          <div className={styles.emptyState} aria-live="polite">
            <p className={styles.emptyTitle}>No more recommendations</p>
            <p className={styles.emptyCopy}>
              People you have invited are hidden from the recommendation stack.
            </p>
            <Button
              themeColor="primary"
              fillMode="solid"
              size="large"
              onClick={resetDeck}
            >
              Review again
            </Button>
          </div>
          <p className={styles.srOnly} aria-live="polite">
            {announcement}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <section className={styles.stage} aria-labelledby="swiper-title">
        <div className={styles.heading}>
          <h1 id="swiper-title" className={styles.title}>
            Recommended profiles
          </h1>
          <p className={styles.counter}>
            {activeIndex + 1} of {recommendations.length}
          </p>
        </div>

        <div
          className={styles.deck}
          role="region"
          aria-roledescription="recommendation swiper"
          aria-describedby="swiper-instructions"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <p id="swiper-instructions" className={styles.srOnly}>
            Press the left arrow key for See you next time or the right arrow
            key for Meet. Use the action buttons after the card for the same
            choices.
          </p>

          {visibleProfiles.map((profile, stackIndex) => {
            const isTopCard = stackIndex === 0;
            const isExiting = exiting?.profileId === profile.id;
            const cardStyle: CardVars = {
              "--drag-x": isTopCard ? `${drag.x}px` : "0px",
              "--drag-y": isTopCard ? `${drag.y}px` : "0px",
              "--drag-rotation": isTopCard ? `${drag.x / 18}deg` : "0deg",
              "--stack-y": `${stackIndex * 14}px`,
              "--card-scale": String(1 - stackIndex * 0.045),
              "--card-opacity": String(1 - stackIndex * 0.18),
              zIndex: profiles.length - stackIndex,
            };
            const cardClassName = [
              styles.profileCard,
              isTopCard ? styles.activeCard : "",
              isTopCard && drag.active ? styles.dragging : "",
              isTopCard && dragIntent === "meet" ? styles.meetIntent : "",
              isTopCard && dragIntent === "next" ? styles.nextIntent : "",
              isExiting && exiting.direction === "meet" ? styles.swipeRight : "",
              isExiting && exiting.direction === "next" ? styles.swipeLeft : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <Card
                key={profile.id}
                orientation="vertical"
                className={cardClassName}
                style={cardStyle}
                role={isTopCard ? "group" : undefined}
                aria-label={
                  isTopCard
                    ? `${profile.name}, ${profile.title} at ${
                        profile.company
                      }. ${profile.description} ${
                        profile.match
                      } percent match. Interested in ${profile.technologies.join(
                        ", ",
                      )}.`
                    : undefined
                }
                aria-hidden={!isTopCard}
                onPointerDown={isTopCard ? handlePointerDown : undefined}
                onPointerMove={isTopCard ? handlePointerMove : undefined}
                onPointerUp={isTopCard ? handlePointerUp : undefined}
                onPointerCancel={isTopCard ? () => setDrag(initialDrag) : undefined}
              >
                <span className={`${styles.stamp} ${styles.nextStamp}`}>
                  Next time
                </span>
                <span className={`${styles.stamp} ${styles.meetStamp}`}>
                  Meet
                </span>
                <CardHeader className={styles.cardHeader}>
                  <p className={styles.kicker}>Potential collaborator</p>
                  <CardTitle className={styles.name}>{profile.name}</CardTitle>
                  <p className={styles.role}>
                    {profile.title} · {profile.company}
                  </p>
                  <p className={styles.description}>{profile.description}</p>
                </CardHeader>
                <CardBody className={styles.cardBody}>
                  <div className={styles.profileLayout}>
                    <div className={styles.avatarMatch}>
                      <svg
                        className={styles.matchRing}
                        viewBox="0 0 120 120"
                        role="img"
                        aria-label={`${profile.match} percent match`}
                      >
                        <circle
                          className={styles.matchTrack}
                          cx="60"
                          cy="60"
                          r={ringRadius}
                        />
                        <circle
                          className={styles.matchProgress}
                          cx="60"
                          cy="60"
                          r={ringRadius}
                          strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                          strokeDashoffset={
                            ringCircumference -
                            (profile.match / 100) * ringCircumference
                          }
                        />
                      </svg>
                      <ProfileAvatar name={profile.name} size="large" />
                      <span className={styles.matchText} aria-hidden="true">
                        {profile.match}% match
                      </span>
                    </div>

                    <div className={styles.techPanel}>
                      <p className={styles.panelLabel}>Interested in</p>
                      <ul className={styles.techList}>
                        {profile.technologies.map((technology) => (
                          <li key={technology} className={styles.techPill}>
                            {technology}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className={styles.srOnly}>
                      {profile.name} is {profile.title} at {profile.company},
                      a {profile.match} percent match, and is interested in{" "}
                      {profile.technologies.join(", ")}.
                    </p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <div className={styles.actions} aria-label="Profile actions">
          <Button
            className={styles.actionButton}
            themeColor="error"
            fillMode="outline"
            size="large"
            svgIcon={cancelIcon}
            disabled={Boolean(exiting)}
            onClick={() => commitSwipe("next")}
            aria-label={`See you next time, ${activeProfile.name}`}
          >
            See you next time
          </Button>
          <Button
            className={styles.actionButton}
            themeColor="success"
            fillMode="solid"
            size="large"
            svgIcon={usersIcon}
            disabled={Boolean(exiting)}
            onClick={() => commitSwipe("meet")}
            aria-label={`Meet ${activeProfile.name}`}
          >
            Meet
          </Button>
        </div>

        <p className={styles.srOnly} aria-live="polite">
          {announcement}
        </p>
      </section>
    </main>
  );
}
