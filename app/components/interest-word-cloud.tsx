"use client";

import type { CSSProperties } from "react";
import { Chip } from "@progress/kendo-react-buttons";
import { Card, CardBody } from "@progress/kendo-react-layout";
import styles from "./interest-word-cloud.module.css";

type UserInterest = {
  name: string;
  company?: string;
  descriptions?: string;
  title?: string;
  interests: string[];
};

type WordCloudVars = CSSProperties & {
  "--word-size": string;
  "--word-weight": string;
};

const users: UserInterest[] = [
  {
    name: "Mira",
    company: "TechCorp",
    descriptions: "Frontend developer with a passion for React and design systems.",
    title: "Frontend Developer",

    interests: ["React", "TypeScript", "Design Systems", "KendoReact"],
  },
  {
    name: "Noah",
    descriptions: "Backend developer with a passion for Node.js and APIs.",
    title: "Backend Developer",
    interests: ["Next.js", "React", "Data Viz", "Postgres"],
  },
  {
    name: "Lena",
    interests: ["Node.js", "GraphQL", "Developer Tools", "TypeScript"],
  },
  {
    name: "Samir",
    interests: ["AI Agents", "Python", "APIs", "Automation"],
  },
  {
    name: "Ava",
    interests: ["Accessibility", "Testing", "React", "UX Research"],
  },
  {
    name: "Theo",
    interests: ["Next.js", "AI Agents", "TypeScript", "APIs"],
  },
  {
    name: "Iris",
    interests: ["Design Systems", "Accessibility", "KendoReact", "Testing"],
  },
  {
    name: "Jun",
    interests: ["React", "Node.js", "Postgres", "GraphQL"],
  },
];

function getInterestCounts() {
  const counts = new Map<string, number>();

  users.forEach((user) => {
    user.interests.forEach((interest) => {
      counts.set(interest, (counts.get(interest) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([interest, count]) => ({ interest, count }))
    .sort((a, b) => b.count - a.count || a.interest.localeCompare(b.interest));
}

const words = getInterestCounts();
const minCount = Math.min(...words.map((word) => word.count));
const maxCount = Math.max(...words.map((word) => word.count));
const topCount = maxCount;

function scaleWord(count: number) {
  if (maxCount === minCount) {
    return 1.35;
  }

  const ratio = (count - minCount) / (maxCount - minCount);
  return 0.95 + ratio * 1.25;
}

export default function InterestWordCloud() {
  const totalMentions = users.reduce(
    (total, user) => total + user.interests.length,
    0,
  );

  return (
    <main className={styles.shell}>
      <Card className={styles.card} orientation="vertical">
        <CardBody className={styles.content}>
          <header className={styles.heading}>
            <h1 className={styles.title}>Interest word cloud</h1>
            <p className={styles.summary}>
              {words.length} topics from {users.length} users, weighted by{" "}
              {totalMentions} interest mentions.
            </p>
          </header>

          <div
            className={styles.cloud}
            role="list"
            aria-label="User interests weighted by popularity"
          >
            {words.map(({ interest, count }) => {
              const size = scaleWord(count);
              const isPopular = count === topCount;
              const wordStyle: WordCloudVars = {
                "--word-size": `${size}rem`,
                "--word-weight": String(Math.round(620 + size * 100)),
              };

              return (
                <Chip
                  key={interest}
                  className={`${styles.word} ${
                    isPopular ? styles.popular : ""
                  }`}
                  text={interest}
                  size="large"
                  rounded="full"
                  fillMode={isPopular ? "solid" : "outline"}
                  themeColor={isPopular ? "success" : "info"}
                  tabIndex={0}
                  role="listitem"
                  ariaDescribedBy={`interest-${interest
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replaceAll(".", "")}`}
                  style={wordStyle}
                />
              );
            })}
          </div>

          <ul className={styles.legend} aria-hidden="true">
            <li className={styles.legendItem}>
              <span className={styles.legendMark} />
              Larger green words are most common
            </li>
            <li className={styles.legendItem}>
              <span
                className={`${styles.legendMark} ${styles.legendMarkSecondary}`}
              />
              Blue outlined words are emerging interests
            </li>
          </ul>

          <div className={styles.srOnly}>
            {words.map(({ interest, count }) => (
              <p
                key={interest}
                id={`interest-${interest
                  .toLowerCase()
                  .replaceAll(" ", "-")
                  .replaceAll(".", "")}`}
              >
                {interest} appears in {count} user{" "}
                {count === 1 ? "profile" : "profiles"}.
              </p>
            ))}
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
