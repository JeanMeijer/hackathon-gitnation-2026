"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip } from "@progress/kendo-react-buttons";
import { Avatar, Card, CardBody } from "@progress/kendo-react-layout";
import { editToolsIcon, plusIcon } from "@progress/kendo-svg-icons";
import {
  defaultUserProfile,
  getProfileSnapshot,
  getInitials,
  subscribeToProfile,
} from "./profile-data";
import styles from "./profile.module.css";

export default function ProfileView() {
  const router = useRouter();
  const profile = useSyncExternalStore(
    subscribeToProfile,
    () => getProfileSnapshot(defaultUserProfile),
    () => defaultUserProfile,
  );

  return (
    <main className={styles.shell}>
      <Card className={styles.card} orientation="vertical">
        <CardBody className={styles.content}>
          <div className={styles.toolbar}>
            <Button
              fillMode="outline"
              themeColor="primary"
              svgIcon={plusIcon}
              onClick={() => router.push("/profile/create")}
            >
              Create profile
            </Button>
            <Button
              fillMode="flat"
              themeColor="primary"
              svgIcon={editToolsIcon}
              onClick={() => router.push("/profile/create")}
            >
              Edit
            </Button>
          </div>

          <section className={styles.identity} aria-labelledby="profile-name">
            <Avatar
              className={styles.avatar}
              type="text"
              rounded="full"
              themeColor="primary"
              aria-hidden="true"
            >
              {getInitials(profile.name)}
            </Avatar>
            <div className={styles.headerText}>
              <h1 id="profile-name" className={styles.name}>
                {profile.name}
              </h1>
              <p className={styles.title}>{profile.title}</p>
              <p className={styles.company}>{profile.company}</p>
            </div>
          </section>

          <p className={styles.description}>{profile.descriptions}</p>

          <section
            className={styles.interests}
            aria-labelledby="profile-interests"
          >
            <h2 id="profile-interests" className={styles.interestsTitle}>
              Interests
            </h2>
            <div className={styles.chipList}>
              {profile.interests.map((interest) => (
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
          </section>
        </CardBody>
      </Card>
    </main>
  );
}
