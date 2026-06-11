"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { Label } from "@progress/kendo-react-labels";
import { Card, CardBody } from "@progress/kendo-react-layout";
import { cancelIcon, saveIcon } from "@progress/kendo-svg-icons";
import {
  availableInterests,
  defaultUserProfile,
  emptyUserProfile,
  getProfileSnapshot,
  saveProfile,
  subscribeToProfile,
  type UserProfile,
} from "../profile-data";
import styles from "../profile.module.css";

type CreateProfileFormProps = {
  cancelHref?: string;
  redirectTo?: string;
  showCancel?: boolean;
  submitLabel?: string;
  summary?: string;
  title?: string;
};

function cleanProfile(profile: UserProfile): UserProfile {
  return {
    name: profile.name.trim(),
    company: profile.company.trim(),
    descriptions: profile.descriptions.trim(),
    title: profile.title.trim(),
    interests: [...new Set(profile.interests.map((interest) => interest.trim()))]
      .filter(Boolean)
      .slice(0, 8),
  };
}

export default function CreateProfileForm({
  cancelHref = "/profile",
  redirectTo = "/profile",
  showCancel = true,
  submitLabel = "Save profile",
  summary = "Tell other attendees who you are and what you want to build around.",
  title = "Create profile",
}: CreateProfileFormProps) {
  const router = useRouter();
  const fallbackProfile = showCancel ? defaultUserProfile : emptyUserProfile;
  const storedProfile = useSyncExternalStore(
    subscribeToProfile,
    () => getProfileSnapshot(fallbackProfile),
    () => fallbackProfile,
  );
  const [draftProfile, setDraftProfile] = useState<UserProfile | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const profile = draftProfile ?? storedProfile;

  const interestOptions = useMemo(
    () => [...new Set([...availableInterests, ...profile.interests])],
    [profile.interests],
  );
  const cleanedProfile = cleanProfile(profile);
  const hasError = submitted && !cleanedProfile.name;
  const canSave =
    cleanedProfile.name.length > 0 &&
    cleanedProfile.title.length > 0 &&
    cleanedProfile.company.length > 0 &&
    cleanedProfile.descriptions.length > 0 &&
    cleanedProfile.interests.length > 0;

  function updateField<Key extends keyof UserProfile>(
    field: Key,
    value: UserProfile[Key],
  ) {
    setDraftProfile((currentProfile) => ({
      ...(currentProfile ?? profile),
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!canSave) {
      return;
    }

    saveProfile(cleanedProfile);
    router.push(redirectTo);
  }

  return (
    <main className={styles.shell}>
      <Card className={styles.formCard} orientation="vertical">
        <CardBody className={styles.content}>
          <header className={styles.formHeader}>
            <h1 className={styles.formTitle}>{title}</h1>
            <p className={styles.formSummary}>{summary}</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <Label editorId="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profile.name}
                placeholder="Mira"
                required
                ariaDescribedBy={hasError ? "profile-name-error" : undefined}
                onChange={(event) => updateField("name", event.value)}
              />
              {hasError ? (
                <p id="profile-name-error" className={styles.errorText}>
                  Name is required.
                </p>
              ) : null}
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.field}>
                <Label editorId="profile-title">Title</Label>
                <Input
                  id="profile-title"
                  value={profile.title}
                  placeholder="Frontend Developer"
                  required
                  onChange={(event) => updateField("title", event.value)}
                />
              </div>

              <div className={styles.field}>
                <Label editorId="profile-company">Company</Label>
                <Input
                  id="profile-company"
                  value={profile.company}
                  placeholder="TechCorp"
                  required
                  onChange={(event) => updateField("company", event.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Label editorId="profile-description">Description</Label>
              <TextArea
                id="profile-description"
                value={profile.descriptions}
                rows={4}
                autoSize
                placeholder="Frontend developer with a passion for React and design systems."
                required
                onChange={(event) => updateField("descriptions", event.value)}
              />
            </div>

            <div className={styles.field}>
              <Label editorId="profile-interests-input">Interests</Label>
              <MultiSelect
                id="profile-interests-input"
                data={interestOptions}
                value={profile.interests}
                allowCustom
                autoClose={false}
                placeholder="Select or type interests"
                onChange={(event) =>
                  updateField("interests", event.value as string[])
                }
              />
              {submitted && cleanedProfile.interests.length === 0 ? (
                <p className={styles.errorText}>
                  Add at least one interest.
                </p>
              ) : null}
            </div>

            <div className={styles.formActions}>
              {showCancel ? (
                <Button
                  type="button"
                  fillMode="outline"
                  svgIcon={cancelIcon}
                  onClick={() => router.push(cancelHref)}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                type="submit"
                themeColor="primary"
                svgIcon={saveIcon}
                disabled={submitted && !canSave}
              >
                {submitLabel}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
