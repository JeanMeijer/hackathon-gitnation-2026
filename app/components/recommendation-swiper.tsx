"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Button } from "@progress/kendo-react-buttons";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@progress/kendo-react-layout";
import { cancelIcon, usersIcon } from "@progress/kendo-svg-icons";
import styles from "./recommendation-swiper.module.css";

type Decision = "next" | "meet";

type Profile = {
  id: string;
  name: string;
  technologies: string[];
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
    id: "mira",
    name: "Mira Patel",
    technologies: ["React", "KendoReact", "Design Systems", "TypeScript"],
    match: 96,
  },
  {
    id: "noah",
    name: "Noah Kim",
    technologies: ["Next.js", "Postgres", "Drizzle", "Data Viz"],
    match: 91,
  },
  {
    id: "lena",
    name: "Lena Ortiz",
    technologies: ["Node.js", "GraphQL", "Developer Tools", "DX"],
    match: 88,
  },
  {
    id: "samir",
    name: "Samir Haddad",
    technologies: ["AI Agents", "Python", "APIs", "Automation"],
    match: 84,
  },
  {
    id: "ava",
    name: "Ava Brooks",
    technologies: ["Accessibility", "React Native", "Testing", "UX Research"],
    match: 79,
  },
];

const initialDrag: DragState = {
  active: false,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
};

const swipeThreshold = 96;
const ringRadius = 54;
const ringCircumference = 2 * Math.PI * ringRadius;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RecommendationSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drag, setDrag] = useState<DragState>(initialDrag);
  const [exiting, setExiting] = useState<{
    profileId: string;
    direction: Decision;
  } | null>(null);
  const [announcement, setAnnouncement] = useState(
    `Showing ${profiles[0].name}, profile 1 of ${profiles.length}.`,
  );
  const animationTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        window.clearTimeout(animationTimer.current);
      }
    };
  }, []);

  const activeProfile = profiles[currentIndex];
  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);
  const dragIntent = drag.x > 28 ? "meet" : drag.x < -28 ? "next" : undefined;

  function commitSwipe(direction: Decision) {
    if (!activeProfile || exiting) {
      return;
    }

    const nextProfile = profiles[currentIndex + 1];

    setExiting({ profileId: activeProfile.id, direction });
    setDrag(initialDrag);
    setAnnouncement(
      `${direction === "meet" ? "Meet selected for" : "See you next time for"} ${
        activeProfile.name
      }. ${
        nextProfile
          ? `Showing ${nextProfile.name}, profile ${currentIndex + 2} of ${
              profiles.length
            }.`
          : "All recommendations reviewed."
      }`,
    );

    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    animationTimer.current = window.setTimeout(() => {
      setCurrentIndex((index) => Math.min(index + 1, profiles.length));
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
    setAnnouncement(`Showing ${profiles[0].name}, profile 1 of ${profiles.length}.`);
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
              Your meeting choices have been saved for this session.
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
            {currentIndex + 1} of {profiles.length}
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
                    ? `${profile.name}. ${profile.match} percent match. Interested in ${profile.technologies.join(
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
                </CardHeader>
                <CardBody>
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
                      <Avatar
                        className={styles.avatar}
                        type="text"
                        rounded="full"
                        themeColor="primary"
                        aria-hidden="true"
                      >
                        {getInitials(profile.name)}
                      </Avatar>
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
                      {profile.name} is a {profile.match} percent match and is
                      interested in {profile.technologies.join(", ")}.
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
