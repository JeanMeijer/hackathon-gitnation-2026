"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip } from "@progress/kendo-react-buttons";
import { Card, CardBody } from "@progress/kendo-react-layout";
import { editToolsIcon, plusIcon } from "@progress/kendo-svg-icons";
import ProfileAvatar from "../components/profile-avatar";
import { emptyUserProfile, type UserProfile } from "./profile-data";
import styles from "./profile.module.css";

export default function ProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : emptyUserProfile))
      .then((data: UserProfile) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setProfile(emptyUserProfile);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!profile) {
    return <main className={styles.shell}>Loading…</main>;
  }

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
            <ProfileAvatar name={profile.name || "Profile"} size="medium" />
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
              Interest cloud
            </h2>
            <div
              className={`${styles.chipList} ${styles.interestCloud}`}
              role="list"
              aria-label="Profile interests"
            >
              {profile.interests.map((interest) => {
                const isTech = profile.interestTypes?.[interest] !== "non_tech";
                return (
                  <Chip
                    key={interest}
                    className={`${styles.chip} ${styles.interestWord}`}
                    text={interest}
                    size="large"
                    rounded="full"
                    fillMode={isTech ? "outline" : "solid"}
                    themeColor={isTech ? "info" : "warning"}
                    role="listitem"
                  />
                );
              })}
            </div>
          </section>
        </CardBody>
      </Card>
    </main>
  );
}
